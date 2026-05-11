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

/**
 * PATCH /api/day/[dayId]
 * Updates a day record by its dayId.
 */
export async function PATCH(request: Request, { params }: IParams): Promise<NextResponse> {
  await connectDB();

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.programId !== undefined) updateData.programId = body.programId;
    if (body.private !== undefined) updateData.private = body.private;
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;

    if (body.date !== undefined) {
      const dayDate = new Date(body.date as string);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      updateData.date = dayDate;
      updateData.dayOfWeek = days[dayDate.getDay()];
    }

    const day = await Day.findOneAndUpdate({ dayId: params.dayId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!day) {
      return NextResponse.json({ message: "Day not found." }, { status: 404 });
    }

    return NextResponse.json({ day }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to update day.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
