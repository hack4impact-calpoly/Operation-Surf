import connectDB from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import { NextResponse } from "next/server";

type IParams = {
  params: {
    username: string;
  };
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { username } = params;
    if (!username) {
      return NextResponse.json({ message: "Username is required." }, { status: 400 });
    }

    const volunteer = await Volunteer.findOne({ username: username });
    if (!volunteer) {
      return NextResponse.json({ message: "Volunteer not found." }, { status: 404 });
    }

    return NextResponse.json(volunteer, { status: 200 });
  } catch (err) {
    console.error("Error fetching volunteer by username:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch volunteer.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
