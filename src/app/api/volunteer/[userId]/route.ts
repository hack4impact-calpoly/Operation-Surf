import connectDB from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authz";
import { client } from "@/database/db";
import { ObjectId } from "mongodb";

type IParams = {
  params: Promise<{
    userId: string;
  }>;
};

/**
 * GET /api/volunteer/[userId]
 * Retrieves volunteer profile data by userId.
 * Admin users receive full volunteer data plus a computed tenure field.
 * Non-admin users receive a limited view with sensitive fields removed.
 * Returns 400 if userId is missing, 404 if the volunteer is not found, and 500 on error.
 */
export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  try {
    await connectDB();
    const authContext = await getAuthContext();

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ message: "UserId is required." }, { status: 400 });
    }

    // Fetch the volunteer record from database
    const volunteer = (await Volunteer.findOne({ userId: userId }).lean()) as Record<string, unknown> | null;
    if (!volunteer) {
      return NextResponse.json({ message: "Volunteer not found." }, { status: 404 });
    }

    if (!authContext.isAdmin) {
      // Non-admin callers should not see administrative volunteer metrics
      const { hours, volunteerCount, ...rest } = volunteer;
      return NextResponse.json(rest, { status: 200 });
    }

    const createdAt = volunteer.createdAt ? new Date(String(volunteer.createdAt)) : null;
    const tenureDays = createdAt
      ? Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return NextResponse.json(
      {
        ...volunteer,
        volunteerTenureDays: tenureDays,
      },
      { status: 200 },
    );
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

// Helpers for PATCH /api/volunteer/[userId]:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-() ]{7,20}$/;
const duplicateEmailMessage = "Account with this email already exists. Please enter another email.";

const isValidString = (value: unknown) => typeof value === "string" && value.trim().length > 0;

const isValidProfileUpdate = (body: Record<string, unknown>) => {
  return (
    isValidString(body.name) &&
    isValidString(body.email) &&
    emailRegex.test(String(body.email)) &&
    isValidString(body.phone) &&
    phoneRegex.test(String(body.phone)) &&
    isValidString(body.location) &&
    isValidEmergencyContact(body.emergencyContact)
  );
};

const isValidEmergencyContact = (value: unknown) => {
  if (typeof value !== "object" || value === null) return false;

  const contact = value as Record<string, unknown>;

  return (
    isValidString(contact.name) &&
    isValidString(contact.phone) &&
    phoneRegex.test(String(contact.phone)) &&
    isValidString(contact.email) &&
    emailRegex.test(String(contact.email)) &&
    (contact.relationship === undefined || typeof contact.relationship === "string")
  );
};

/**
 * PATCH /api/volunteer/[userId]
 * Updates editable volunteer profile fields by userId.
 * Admin users can update any volunteer profile.
 * Non-admin users can only update their own volunteer profile.
 * Returns 400 for invalid data, 401 if not signed in, 403 if forbidden,
 * 404 if the volunteer is not found, and 500 on error.
 */
export async function PATCH(request: Request, { params }: IParams): Promise<NextResponse> {
  try {
    await connectDB();
    const authContext = await getAuthContext();

    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ message: "UserId is required." }, { status: 400 });
    }

    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!authContext.isAdmin && authContext.userId !== userId) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (!isValidProfileUpdate(body)) {
      return NextResponse.json({ message: "Invalid profile update." }, { status: 400 });
    }

    const emergencyContact = body.emergencyContact as Record<string, unknown>;

    // Trim inputs
    const trimmedName = (body.name as string).trim();
    const trimmedEmail = (body.email as string).trim();
    const trimmedPhone = (body.phone as string).trim();
    const trimmedLocation = (body.location as string).trim();

    // For validating email updates (prevent collisions)
    const existingVolunteer = (await Volunteer.findOne({ userId: userId }).lean()) as Record<string, unknown> | null;

    if (!existingVolunteer) {
      return NextResponse.json({ message: "Volunteer not found." }, { status: 404 });
    }

    const currentEmail = String(existingVolunteer.email ?? "").toLowerCase();
    const nextEmail = trimmedEmail.toLowerCase();

    if (nextEmail !== currentEmail) {
      const duplicateVolunteer = await Volunteer.findOne({
        email: nextEmail,
        userId: { $ne: userId },
      }).lean();

      const duplicateAuthUser = await client
        .db()
        .collection("user")
        .findOne({
          email: nextEmail,
          _id: { $ne: new ObjectId(userId) },
        });

      if (duplicateVolunteer || duplicateAuthUser) {
        return NextResponse.json({ message: duplicateEmailMessage }, { status: 409 });
      }
    }

    // Update only editable profile fields from the volunteer dashboard
    const updatedVolunteer = (await Volunteer.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          name: trimmedName,
          email: nextEmail,
          phone: trimmedPhone,
          location: trimmedLocation,
          "emergencyContact.name": String(emergencyContact.name).trim(),
          "emergencyContact.relationship": String(emergencyContact.relationship ?? "").trim(),
          "emergencyContact.phone": String(emergencyContact.phone).trim(),
          "emergencyContact.email": String(emergencyContact.email).trim().toLowerCase(),
        },
      },
      { new: true, runValidators: true },
    ).lean()) as Record<string, unknown> | null;

    if (!updatedVolunteer) {
      return NextResponse.json({ message: "Volunteer not found." }, { status: 404 });
    }

    // Keep Better Auth user data in sync with volunteer profile data
    const authUpdate = await client
      .db()
      .collection("user")
      .updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            name: trimmedName,
            email: nextEmail,
            updatedAt: new Date(),
          },
        },
      );

    if (authUpdate.matchedCount === 0) {
      return NextResponse.json({ message: "Auth user not found." }, { status: 404 });
    }

    return NextResponse.json(updatedVolunteer, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to update volunteer.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
