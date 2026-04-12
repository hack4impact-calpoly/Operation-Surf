import connectDB from "@/database/db";
import Shift from "@/database/models/Shift";
import { NextResponse } from "next/server";

type IParams = {
  params: {
    shiftId: string;
  };
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  try {
    await connectDB();

    const shift = await Shift.findOne({ shiftId: params.shiftId }).lean();

    if (!shift) {
      return NextResponse.json(
        {
          message: "Shift not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        data: shift,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        message: "Failed to retrieve shift.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  const { shiftId } = params;

  try {
    const shift = await Shift.findOneAndDelete({ shiftId: shiftId });
    // check if shift exists
    if (!shift) {
      return NextResponse.json({ message: "Shift not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Shift deleted successfully.",
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to delete shift.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
