import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";

/**
 * gets 1 day from the database based on the dayId
 * returns the day in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

type IParams = {
  params: {
    dayId: string;
  };
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

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

    if (view === "expanded-shift-details") {
      const program = await Program.findOne({ programId: day.programId });
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
    console.error("Error fetching day:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch day.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
