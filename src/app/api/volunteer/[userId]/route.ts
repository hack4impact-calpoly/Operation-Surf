import connectDB from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authz";

type IParams = {
  params: {
    userId: string;
  };
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

    const { userId } = params;

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
