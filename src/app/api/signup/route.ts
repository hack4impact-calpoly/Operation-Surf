import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Signup from "@/database/models/signupSchema";
import { ObjectId } from "mongodb";
import { sign } from "crypto";

/**
 * gets all signups from the database
 * returns all signups in the database as a JSON response
 * if an error occurs, returns a JSON response with an error message and status code 500
 */

export async function GET(): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  try {
    const signups = await Signup.find();
    return NextResponse.json(
      {
        signups: signups,
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

  try {
    const body = await request.json();

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
