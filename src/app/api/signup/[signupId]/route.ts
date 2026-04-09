import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Signup from "@/database/models/signupSchema";

/**
 * gets 1 signup from the database based on the signupId
 * returns all signups in the database as a JSON response
 * if an error occurs, returns a JSON response w
      signupId: new ObjectId().toString(),ith an error message and status code 500
 */

type IParams = {
  params: {
    signupId: String;
  };
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  const { signupId } = params;

  try {
    const signup = await Signup.findOne({ signupId: signupId });
    // check if signup exists
    if (!signup) {
      return NextResponse.json({ message: "Signup not found." }, { status: 404 });
    }
    // if signup exists, return it
    return NextResponse.json(
      {
        signup: signup,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching signup:", err);
    return NextResponse.json({
      message: "Failed to fetch signup.",
      error: err instanceof Error ? err.message : "An unknown error occurred.",
      status: 500,
    });
  }
}
