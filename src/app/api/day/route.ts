import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";
import { getAuthContext } from "@/lib/authz";

/**
 * gets all days from the database
 * returns all days in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

export async function GET(): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  try {
    const authContext = await getAuthContext();
    const dayFilter: Record<string, unknown> = {};

    if (!authContext.isAuthenticated) {
      dayFilter.private = false;
    }

    const visibleProgramsFilter: Record<string, unknown> = {
      ghost_program: false,
    };

    if (!authContext.isAuthenticated) {
      visibleProgramsFilter.private = false;
    }

    const visiblePrograms = await Program.find(visibleProgramsFilter, { programId: 1 });
    const visibleProgramIds = visiblePrograms.map((program) => program.programId);

    dayFilter.programId = { $in: visibleProgramIds };

    const days = await Day.find(dayFilter).sort({ date: 1, startTime: 1 });
    return NextResponse.json(
      {
        days: days,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching days:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch days.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

/*
 * creates a new program in the database
 * request must require the following fields: 
 *  name: string;
    date: Date;
    startTime: string;
    endTime: string;
    programId: string;
    dayId: string;
 */
export async function POST(request: Request): Promise<NextResponse> {
  await connectDB();

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  try {
    // ensure required fields are present

    // "dayOfWeek" is not required because it will be derived from the "date" field
    const requiredFields = ["name", "date", "startTime", "endTime", "programId", "dayId"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const dayDate = new Date(body.date as string);

    // convert the date to a day of the week string (e.g., "Monday", "Tuesday", etc.)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[dayDate.getDay()];

    const newDay = new Day({
      name: body.name,
      dayOfWeek: dayName,
      date: new Date(body.date as string),
      startTime: body.startTime,
      endTime: body.endTime,
      programId: body.programId,
      dayId: body.dayId,
      private: body.private,
    });

    const saved = await newDay.save();

    return NextResponse.json(
      {
        day: saved,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating day:", err);
    return NextResponse.json(
      {
        message: "Failed to create day.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
