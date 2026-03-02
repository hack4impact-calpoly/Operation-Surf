import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Day from "@/database/models/daySchema";

/**
 * gets all days from the database
 * returns all days in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

export async function GET(): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  try {
    const days = await Day.find();
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

  try {
    const body = await request.json();

    // ensure required fields are present

    // "dayOfWeek" is not required because it will be derived from the "date" field
    const requiredFields = ["name", "date", "startTime", "endTime", "programId", "dayId"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const dayDate = new Date(body.date);

    // convert the date to a day of the week string (e.g., "Monday", "Tuesday", etc.)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[dayDate.getDay()];

    const newDay = new Day({
      name: body.name,
      dayOfWeek: dayName,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      programId: body.programId,
      dayId: body.dayId,
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
