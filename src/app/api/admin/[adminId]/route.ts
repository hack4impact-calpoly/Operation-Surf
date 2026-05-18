import connectDB from "@/database/db";
import Admin from "@/database/models/adminSchema";
import { NextResponse } from "next/server";

type IParams = {
  params: {
    adminId: string;
  };
};

/**
 * GET /api/admin/[adminId]
 * Retrieves admin profile data by adminId.
 * Returns 400 if adminId is missing, 404 if the admin is not found, and 500 on error.
 */
export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  try {
    await connectDB();

    const { adminId } = params;

    if (!adminId) {
      return NextResponse.json({ message: "AdminId is required." }, { status: 400 });
    }

    // Fetch the admin record from database
    const admin = await Admin.findOne({ adminId: adminId }).lean();

    if (!admin) {
      return NextResponse.json({ message: "Admin not found." }, { status: 404 });
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to fetch admin.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
