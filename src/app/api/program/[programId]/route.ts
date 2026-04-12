import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Program from "@/database/models/programSchema";

/**
 * gets 1 program from the database based on the programId
 * returns all programs in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

type IParams = {
  params: {
    programId: string;
  };
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  const { programId } = params;

  try {
    const program = await Program.findOne({ programId: programId });
    // check if program exists
    if (!program) {
      return NextResponse.json(
        {
          message: "Program not found.",
        },
        { status: 404 },
      );
    }
    // if program exists, return it
    return NextResponse.json(
      {
        program,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching program:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch program.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
