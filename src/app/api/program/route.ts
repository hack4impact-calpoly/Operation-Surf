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
    const programs = await Program.find();
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
