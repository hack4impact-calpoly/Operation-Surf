import connectDB from "@/database/db";
import Shift from "@/database/models/Shift";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authz";

/**
 * GET /api/shift
 * Returns shifts visible to the current user.
 * - Admin users see all shifts.
 * - Authenticated non-admin users see public shifts plus invited shifts addressed to them.
 * - Unauthenticated visitors only see public shifts for non-private programs and days.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const authContext = await getAuthContext();
    const shiftFilter: Record<string, unknown> = {};

    if (!authContext.isAdmin) {
      if (!authContext.isAuthenticated || !authContext.userId) {
        shiftFilter.visibility = "public";
      } else {
        shiftFilter.$or = [{ visibility: "public" }, { visibility: "invited", invited: authContext.userId }];
      }

      // Only include programs that are not ghosted.
      const visibleProgramsFilter: Record<string, unknown> = {
        ghost_program: false,
      };

      if (!authContext.isAuthenticated) {
        // Unauthenticated users cannot see private programs.
        visibleProgramsFilter.private = false;
      }

      const visiblePrograms = await Program.find(visibleProgramsFilter, { programId: 1 }).lean();
      const visibleProgramIds = visiblePrograms.map((program) => program.programId);

      const visibleDaysFilter: Record<string, unknown> = {
        programId: { $in: visibleProgramIds },
      };

      if (!authContext.isAuthenticated) {
        // Unauthenticated users cannot see private days.
        visibleDaysFilter.private = false;
      }

      const visibleDays = await Day.find(visibleDaysFilter, { dayId: 1 }).lean();
      const visibleDayIds = visibleDays.map((day) => day.dayId);

      shiftFilter.dayId = { $in: visibleDayIds };
    }

    const shifts = await Shift.find(shiftFilter).sort({ date: 1, startTime: 1 }).lean();

    return NextResponse.json(
      {
        data: shifts,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        message: "Failed to retrieve shifts.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/shift
 * Creates a new shift record.
 * Validates required fields, enforces allowed visibility values,
 * and computes the day of week from the provided date.
 * Invited shifts must include at least one invited volunteer userId.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const body = await request.json();

    const visibility = body.visibility ?? "public";

    if (visibility !== "public" && visibility !== "invited") {
      return NextResponse.json(
        {
          message: "Invalid visibility value. Allowed values are 'public' and 'invited'.",
        },
        { status: 400 },
      );
    }

    const requiredFields = [
      "name",
      "date",
      "startTime",
      "endTime",
      "totalSlots",
      "location",
      "shiftId",
      "dayId",
      "description",
    ];
    const missingFields = requiredFields.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === "",
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: "Missing required fields.",
          missingFields,
        },
        { status: 400 },
      );
    }

    const invited = Array.isArray(body.invited) ? body.invited : [];
    if (visibility === "invited" && invited.length === 0) {
      return NextResponse.json(
        {
          message: "Invited shifts require at least one invited volunteer userId.",
        },
        { status: 400 },
      );
    }

    const dayDate = new Date(body.date as string);

    // Convert the date into a human-readable weekday name.
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[dayDate.getDay()];

    const newShift = await Shift.create({
      ...body,
      locationInfo: body.locationInfo ?? "",
      byoDescription: body.byoDescription ?? "",
      dayOfWeek: dayName,
      date: dayDate,
      totalSlots: Number(body.totalSlots),
      visibility,
      invited,
    });

    return NextResponse.json(
      {
        data: newShift,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        message: "Failed to create shift.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
