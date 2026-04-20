import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";
import { getAuthContext } from "@/lib/authz";

/**
 * GET /api/day/[dayId]
 * Retrieves a single day entry by its dayId.
 * - Returns 404 when the day does not exist.
 * - Restricts private or ghosted program/day records to authenticated users.
 * - Supports `view=expanded-shift-details` for richer shift metadata.
 */
type IParams = {
  params: {
    dayId: string;
  };
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();
  const authContext = await getAuthContext();

  const { dayId } = params;

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    const day = await Day.findOne({ dayId: dayId });
    // check if day exists
    if (!day) {
      return NextResponse.json(
        {
          message: "Day not found.",
        },
        { status: 404 },
      );
    }

    // Private days are hidden from unauthenticated users.
    if (day.private && !authContext.isAuthenticated) {
      return NextResponse.json(
        {
          message: "Day not found.",
        },
        { status: 404 },
      );
    }

    const program = await Program.findOne({ programId: day.programId });
    if ((program?.private || program?.ghost_program) && !authContext.isAuthenticated) {
      return NextResponse.json(
        {
          message: "Day not found.",
        },
        { status: 404 },
      );
    }

    if (view === "expanded-shift-details") {
      const dayRecord = day.toObject() as Record<string, unknown>;

      return NextResponse.json(
        {
          expandedShiftDetails: {
            shiftId: day.dayId,
            title: day.name,
            description: dayRecord.description ?? null,
            dayOfWeek: day.dayOfWeek,
            date: day.date,
            startTime: day.startTime,
            endTime: day.endTime,
            location: dayRecord.location ?? null,
            address: dayRecord.address ?? null,
            mapLink: dayRecord.mapLink ?? null,
            role: dayRecord.role ?? null,
            contactInfo: dayRecord.contactInfo ?? null,
            program: program
              ? {
                  programId: program.programId,
                  title: program.programName,
                  location: program.location,
                  imageURI: program.imageURI,
                }
              : null,
          },
        },
        { status: 200 },
      );
    }

    // if day exists, return it
    return NextResponse.json(
      {
        day: day,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to fetch day.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/day/[dayId]
 * Deletes a day record by its dayId.
 * Returns 404 if the day does not exist and 500 on unexpected errors.
 */
export async function DELETE(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  const { dayId } = params;

  try {
    const day = await Day.findOneAndDelete({ dayId: dayId });
    // check if day exists
    if (!day) {
      return NextResponse.json({ message: "Day not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Day deleted successfully.",
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to delete day.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
