import connectDB from "@/database/db";
import Shift from "@/database/models/Shift";
import { NextResponse } from "next/server";

type RouteContext = {
  params: {
    shiftId: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  try {
    await connectDB();

    const shift = await Shift.findOne({ shiftId: params.shiftId }).lean();

    if (!shift) {
      return NextResponse.json(
        {
          status: "error",
          message: "Shift not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: shift,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve shift.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
