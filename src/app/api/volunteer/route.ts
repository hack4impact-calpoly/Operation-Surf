import connectDB from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthContext } from "@/lib/authz";

const toAdminVolunteerPayload = (volunteer: Record<string, unknown>) => {
  const createdAt = volunteer.createdAt ? new Date(String(volunteer.createdAt)) : null;
  const tenureDays = createdAt
    ? Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    ...volunteer,
    volunteerTenureDays: tenureDays,
  };
};

const toNonAdminVolunteerPayload = (volunteer: Record<string, unknown>) => {
  const { hours, volunteerCount, ...rest } = volunteer;
  return rest;
};

export async function GET(request: NextRequest) {
  try {
    // Attempt to connect to the database
    await connectDB();
    const authContext = await getAuthContext();

    const volunteers = (await Volunteer.find().lean()) as Record<string, unknown>[];
    const payload = authContext.isAdmin
      ? volunteers.map((volunteer) => toAdminVolunteerPayload(volunteer))
      : volunteers.map((volunteer) => toNonAdminVolunteerPayload(volunteer));

    return NextResponse.json({ volunteers: payload }, { status: 200 });
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

Better Auth signin first to validate username and get userId
- checks username/email is not taken
-creates session

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

    //create user documents

    const data = await auth.api.signUpEmail({
      body: {
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
      },
    });

    console.log(data);

    if (!data) {
      throw new Error("username is taken");
    }

    const volunteerData = {
      userId: data.user.id,
      ...body,
    };

    const volunteer = new Volunteer(volunteerData);
    await volunteer.save();

    return NextResponse.json(volunteer, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to create volunteer.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 400 },
    );
  }
}
