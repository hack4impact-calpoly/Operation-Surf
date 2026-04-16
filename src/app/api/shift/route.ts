import connectDB from "@/database/db";
import Shift from "@/database/models/Shift";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const shifts = await Shift.find({}).sort({ date: 1, startTime: 1 }).lean();

    return NextResponse.json(
      {
        data: shifts,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
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
      "date",
      "startTime",
      "endTime",
      "totalSlots",
      "location",
      "shiftId",
      "dayId",
      "description",
    ];
    const missingFields = requiredFields.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === "",
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: "Missing required fields.",
          missingFields,
        },
        { status: 400 },
      );
    }

    const dayDate = new Date(body.date as string);

    // convert the date to a day of the week string (e.g., "Monday", "Tuesday", etc.)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[dayDate.getDay()];

    const newShift = await Shift.create({
      ...body,
      dayOfWeek: dayName,
      date: dayDate,
      totalSlots: Number(body.totalSlots),
    });

    return NextResponse.json(
      {
        data: newShift,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        message: "Failed to create shift.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
