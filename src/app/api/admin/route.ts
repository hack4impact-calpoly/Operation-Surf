import connectDB from "@/database/db";
import Admin from "@/database/models/adminSchema";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
/**
 * GET /api/admin
 * Returns all admin profiles.
 */
export async function GET(request: NextRequest) {
  try {
    // Attempt to connect to the database
    await connectDB();

    const admins = await Admin.find().lean();
    return NextResponse.json({ admins }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to fetch admins.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 400 },
    );
  }
}

/**
 * POST /api/admin
 * Creates a new admin profile.
 * The auth user is created first via auth.api.signUpEmail,
 * then the admin document is stored with the generated userId.
 * The frontend should validate form fields, but the backend must still
 * handle duplicate usernames and missing required values safely.
 */
export async function POST(request: NextRequest) {
  try {
    // Attempt to connect to the database
    await connectDB();

    const body = await request.json();

    // Validate required fields

    const requiredFields = ["name", "username", "email", "password", "role"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    //create admin documents

    const data = await auth.api.signUpEmail({
      body: {
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
      },
    });

    if (!data) {
      throw new Error("username or email is taken");
    }

    const adminData = {
      adminId: data.user.id,
      ...body,
    };

    const admin = new Admin(adminData);
    await admin.save();

    return NextResponse.json(admin, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to create admin.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 400 },
    );
  }
}
