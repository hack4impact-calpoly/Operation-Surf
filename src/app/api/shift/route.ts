import connectDB from "@/database/db";
import Shift from "@/database/models/Shift";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const shifts = await Shift.find({}).sort({ date: 1, startTime: 1 }).lean();

    return NextResponse.json(
      {
        status: "success",
        data: shifts,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve shifts.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const body = await request.json();

    const requiredFields = [
      "name",
      "dayOfWeek",
      "date",
      "startTime",
      "endTime",
      "totalSlots",
      "location",
      "shiftId",
      "eventId",
    ];
    const missingFields = requiredFields.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === "",
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields.",
          missingFields,
        },
        { status: 400 },
      );
    }

    const newShift = await Shift.create({
      ...body,
      date: new Date(body.date),
      totalSlots: Number(body.totalSlots),
    });

    return NextResponse.json(
      {
        status: "success",
        data: newShift,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create shift.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
