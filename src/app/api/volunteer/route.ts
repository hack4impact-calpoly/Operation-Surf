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

/**
 * GET /api/volunteer
 * Returns all volunteer profiles.
 * - Admin users receive full volunteer records plus computed tenure.
 * - Non-admin users receive a trimmed result without admin-only metrics.
 */
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
    console.error("Error fetching volunteers:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch volunteers.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/volunteer
 * Creates a new volunteer profile.
 * The auth user is created first via auth.api.signUpEmail,
 * then the volunteer document is stored with the generated userId.
 * The frontend should validate form fields, but the backend must still
 * handle duplicate usernames and missing required values safely.
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
