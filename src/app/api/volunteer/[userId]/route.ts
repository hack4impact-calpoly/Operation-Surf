import connectDB from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import { NextResponse } from "next/server";

type IParams = {
  params: {
    userId: string;
  };
};

/* 
Get a volunteer by userId
*/

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ message: "UserId is required." }, { status: 400 });
    }

    const volunteer = await Volunteer.findOne({ userId: userId });
    if (!volunteer) {
      return NextResponse.json({ message: "Volunteer not found." }, { status: 404 });
    }

    return NextResponse.json(volunteer, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to fetch volunteer.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
