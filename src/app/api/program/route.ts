import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Program from "@/database/models/programSchema";
import Day from "@/database/models/daySchema";

/**
 * gets all programs from the database
 * returns all programs in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

export async function GET(request: Request): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    const programs = await Program.find().sort({ date: 1 });

    if (view === "available-programs") {
      const days = await Day.find().sort({ date: 1 });

      const daysByProgramId = new Map<string, typeof days>();
      for (const day of days) {
        const list = daysByProgramId.get(day.programId) ?? [];
        list.push(day);
        daysByProgramId.set(day.programId, list);
      }

      const availablePrograms = programs.map((program) => {
        const programDays = daysByProgramId.get(program.programId) ?? [];

        return {
          programId: program.programId,
          title: program.programName,
          imageURI: program.imageURI,
          location: program.location,
          date: program.date,
          duration: program.duration,
          shiftCount: programDays.length,
          shifts: programDays.map((day) => ({
            shiftId: day.dayId,
            name: day.name,
            dayOfWeek: day.dayOfWeek,
            date: day.date,
            startTime: day.startTime,
            endTime: day.endTime,
          })),
        };
      });

      return NextResponse.json(
        {
          availablePrograms,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        programs,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching programs:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch programs.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

/**
 * creates a new program in the database
 * request must require the following fields: 
 *  imageURI: string;
    location: string;
    date: Date;
    duration: string;
    programName: string;
    programId: string;
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
    const requiredFields = ["imageURI", "location", "date", "duration", "programName", "programId"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const newProgram = new Program({
      imageURI: body.imageURI,
      location: body.location,
      date: new Date(body.date as string),
      duration: body.duration,
      programName: body.programName,
      programId: body.programId,
    });

    const saved = await newProgram.save();

    return NextResponse.json(
      {
        program: saved,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating program:", err);
    return NextResponse.json(
      {
        message: "Failed to create program.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
