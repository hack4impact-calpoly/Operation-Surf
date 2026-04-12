import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Signup from "@/database/models/signupSchema";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";

/**
 * gets all signups from the database
 * returns all signups in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

export async function GET(request: Request): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const view = searchParams.get("view");

    const signupQuery = profileId ? { profileId } : {};
    const signups = await Signup.find(signupQuery).sort({ timestamp: -1 });

    if (view === "registered-shifts") {
      const shiftIds = signups.map((signup) => signup.shiftId);
      const shifts = await Day.find({ dayId: { $in: shiftIds } });
      const programIds = Array.from(new Set(shifts.map((shift) => shift.programId)));
      const programs = await Program.find({ programId: { $in: programIds } });

      const shiftById = new Map(shifts.map((shift) => [shift.dayId, shift]));
      const programById = new Map(programs.map((program) => [program.programId, program]));

      const registeredShifts = signups.map((signup) => {
        const shift = shiftById.get(signup.shiftId);
        const program = shift ? programById.get(shift.programId) : null;

        return {
          signupId: signup.signupId,
          profileId: signup.profileId,
          timestamp: signup.timestamp,
          waiver: signup.waiver,
          shift: {
            shiftId: shift?.dayId ?? signup.shiftId,
            name: shift?.name ?? null,
            dayOfWeek: shift?.dayOfWeek ?? null,
            date: shift?.date ?? null,
            startTime: shift?.startTime ?? null,
            endTime: shift?.endTime ?? null,
            location: null,
            role: null,
            description: null,
          },
          program: program
            ? {
                programId: program.programId,
                title: program.programName,
                location: program.location,
                imageURI: program.imageURI,
              }
            : null,
        };
      });

      return NextResponse.json(
        {
          registeredShifts,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        signups,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching signups:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch signups.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

/*
 * creates a new signup in the database
 * request must require the following fields: 
 *  shiftId: string;
    profileId: string;
    waiver: boolean;
 */

export async function POST(request: Request): Promise<NextResponse> {
  await connectDB();

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  try {
    // ensure required fields are present

    // "timestamp" is not required in the request body because it will be generated automatically when the signup is created

    const requiredFields = ["shiftId", "profileId", "waiver"];

    for (const field of requiredFields) {
      if (!body[field]) {
        // if waiver is false, it will be sent as "false" in the request body, which is a falsy value in JavaScript. To account for this, we need to check if the field is explicitly undefined rather than just falsy.
        if (field === "waiver" && body[field] === false) {
          continue; // skip the check for waiver if it's false
        }
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const newSignup = new Signup({
      signupId: crypto.randomUUID(),
      shiftId: body.shiftId,
      profileId: body.profileId,
      waiver: body.waiver,
      timestamp: new Date(),
    });

    const saved = await newSignup.save();

    return NextResponse.json(
      {
        signup: saved,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error creating signup:", err);
    return NextResponse.json(
      {
        message: "Failed to create signup.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
