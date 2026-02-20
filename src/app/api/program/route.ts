import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Program from "@/database/models/programSchema";

/**
 * gets all programs from the database
 * @returns {Promise<NextResponse>}
 */
export async function GET(): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  try {
    let programs = await Program.find().orFail();
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
