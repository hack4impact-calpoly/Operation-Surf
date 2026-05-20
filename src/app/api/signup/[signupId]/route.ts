import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Signup from "@/database/models/signupSchema";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";

/**
 * GET /api/signup/[signupId]
 * Retrieves a specific signup from the database by signupId.
 * Optional query parameter:
 * - view: If "confirmation", returns enriched signup confirmation data; if "check-in", returns check-in details
 * Returns the signup data or enriched view in JSON format.
 * If signup not found, returns 404; on error, returns 500 with error details.
 */

type IParams = {
  params: Promise<{
    signupId: string;
  }>;
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  const { signupId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    // Fetch the signup by ID
    const signup = await Signup.findOne({ signupId: signupId });
    // check if signup exists
    if (!signup) {
      return NextResponse.json({ message: "Signup not found." }, { status: 404 });
    }

    // Fetch related shift and program data
    const shift = await Day.findOne({ dayId: signup.shiftId });
    const program = shift ? await Program.findOne({ programId: shift.programId }) : null;
    const shiftRecord = shift ? (shift.toObject() as Record<string, unknown>) : null;

    if (view === "confirmation") {
      // Return enriched confirmation data including shift and program details
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

    // Default response: return raw signup data
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

export async function DELETE(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  const { signupId } = await params;

  try {
    const signup = await Signup.findOneAndDelete({ signupId: signupId });
    // check if signup exists
    if (!signup) {
      return NextResponse.json({ message: "Signup not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Signup deleted successfully.",
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to delete signup.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
