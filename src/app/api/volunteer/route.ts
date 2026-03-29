import connectDB from "@/database/db";
import bcrypt from "bcrypt";
import Volunteer from "@/database/models/volunteerSchema";
import { NextRequest, NextResponse } from "next/server";

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

/* 
Frontend should enforce validation of required fields such as email format, password strength, and valid shirt sizes before sending the request. The backend will check for the presence of required fields but will rely on the frontend for detailed validation.

Note: height = number in cm
      sex = one of "female", "male", "intersex", "prefer_not_to_say", "other"
      shirtSize = one of "XS", "S", "M", "L", "XL", "2XL", "3XL"

Example JSON body for creating a volunteer:
{
  "name": "hey",
  "username": "heyDoe",
  "password": "password",
  "email": "johndoe@example.com",
  "phone": "555-123-4567",
  "height": 180,
  "weight": 170,
  "sex": "male",
  "birthday": "1995-06-15",
  "location": "Sacramento, CA",

  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Sister",
    "phone": "555-987-6543",
    "email": "janedoe@example.com"
  },

  "skillsOrExperience": "First aid certified, event setup experience",
  "shirtSize": "XL",
  "interests": "Community service, outdoor events",

  "liabilityWaiver": [
    {
      "shiftId": "shift_000",
      "accepted": true,
      "acceptedAt": "2026-03-27",
      "expiresAt": "2027-03-27"
    },
    {
      "shiftId": "shift_123",
      "accepted": false,
    }
  ],

  "backgroundCheck": false
}

*/

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
