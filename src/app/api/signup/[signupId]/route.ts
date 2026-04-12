import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Signup from "@/database/models/signupSchema";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";

/**
 * gets 1 signup from the database based on the signupId
 * returns the signup in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
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
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    const signup = await Signup.findOne({ signupId: signupId });
    // check if signup exists
    if (!signup) {
      return NextResponse.json({ message: "Signup not found." }, { status: 404 });
    }

    const shift = await Day.findOne({ dayId: signup.shiftId });
    const program = shift ? await Program.findOne({ programId: shift.programId }) : null;
    const shiftRecord = shift ? (shift.toObject() as Record<string, unknown>) : null;

    if (view === "confirmation") {
      return NextResponse.json(
        {
          signupConfirmation: {
            signupId: signup.signupId,
            profileId: signup.profileId,
            waiver: signup.waiver,
            timestamp: signup.timestamp,
            shift: {
              shiftId: shift?.dayId ?? signup.shiftId,
              title: shift?.name ?? null,
              dayOfWeek: shift?.dayOfWeek ?? null,
              date: shift?.date ?? null,
              startTime: shift?.startTime ?? null,
              endTime: shift?.endTime ?? null,
              location: shiftRecord?.location ?? null,
              address: shiftRecord?.address ?? null,
              mapLink: shiftRecord?.mapLink ?? null,
              role: shiftRecord?.role ?? null,
              contactInfo: shiftRecord?.contactInfo ?? null,
            },
            program: program
              ? {
                  programId: program.programId,
                  title: program.programName,
                  location: program.location,
                }
              : null,
            checkIn: {
              status: "not-checked-in",
              eligibleAt: shift?.date ?? null,
            },
          },
        },
        { status: 200 },
      );
    }

    if (view === "check-in") {
      return NextResponse.json(
        {
          volunteerCheckIn: {
            signupId: signup.signupId,
            profileId: signup.profileId,
            shiftId: signup.shiftId,
            role: shiftRecord?.role ?? null,
            shiftDate: shift?.date ?? null,
            checkedIn: false,
            checkedInAt: null,
          },
        },
        { status: 200 },
      );
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
    return NextResponse.json(
      {
        message: "Failed to fetch signup.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
