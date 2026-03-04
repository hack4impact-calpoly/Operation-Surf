import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Program from "@/database/models/programSchema";

/**
 * gets all programs from the database
 * returns all programs in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

export async function GET(): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  try {
    const programs = await Program.find().sort({ date: 1 });
    return NextResponse.json({
      programs: programs,
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching programs:", err);
    return NextResponse.json({
      message: "Failed to fetch programs.",
      error: err instanceof Error ? err.message : "An unknown error occurred.",
      status: 500,
    });
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

  try {
    const body = await request.json();

    // ensure required fields are present
    const requiredFields = ["imageURI", "location", "date", "duration", "programName", "programId"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}`, status: 400 });
      }
    }

    const newProgram = new Program({
      imageURI: body.imageURI,
      location: body.location,
      date: new Date(body.date),
      duration: body.duration,
      programName: body.programName,
      programId: body.programId,
    });

    const saved = await newProgram.save();

    return NextResponse.json({
      program: saved,
      status: 201,
    });
  } catch (err) {
    console.error("Error creating program:", err);
    return NextResponse.json({
      message: "Failed to create program.",
      error: err instanceof Error ? err.message : "An unknown error occurred.",
      status: 500,
    });
  }
}
