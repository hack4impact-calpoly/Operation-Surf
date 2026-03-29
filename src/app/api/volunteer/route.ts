import connectDB from "@/database/db";
import bcrypt from "bcrypt";
import Volunteer from "@/database/models/volunteerSchema";
import { NextRequest, NextResponse } from "next/server";
import { create } from "domain";

const SALT_ROUNDS = 10;

export async function GET(request: NextRequest) {
  try {
    // Attempt to connect to the database
    await connectDB();

    const volunteers = await Volunteer.find();
    return NextResponse.json({ volunteers: volunteers }, { status: 200 });
  } catch (err) {
    console.error("Error fetching signups:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch volunteers.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Attempt to connect to the database
    await connectDB();

    const body = await request.json();

    // required fields validation
    const required = [
      "name",
      "username",
      "password",
      "email",
      "phone",
      "height",
      "weight",
      "sex",
      "birthday",
      "location",
      "emergencyContact",
      "skillsOrExperience",
      "shirtSize",
      "interests",
      "liabilityWaiver",
    ];

    const missing = required.filter((key) => !Object.prototype.hasOwnProperty.call(body, key));
    if (missing.length) {
      return NextResponse.json({ error: `Missing required volunteer fields: ${missing.join(", ")}` }, { status: 400 });
    }

    // hash password before saving

    const hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);

    const volunteerData = {
      ...body,
      password: hashedPassword,
    };

    const volunteer = new Volunteer(volunteerData);
    await volunteer.save();

    return NextResponse.json(volunteer, { status: 201 });
  } catch (err) {
    console.error("Error fetching signups:", err);
    return NextResponse.json(
      {
        message: "Failed to create volunteer.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
