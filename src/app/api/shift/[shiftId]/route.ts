import connectDB from "@/database/db";
import Shift from "@/database/models/Shift";
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/authz";

type IParams = {
  params: {
    shiftId: string;
  };
};

/**
 * GET /api/shift/[shiftId]
 * Retrieves a single shift by its shiftId.
 * - Admin users can view all shifts.
 * - Non-admin users can view public shifts and invited shifts only if they are invited.
 * Returns 404 if the shift does not exist, 403 if access is denied, and 500 on error.
 */
export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  try {
    await connectDB();
    const authContext = await getAuthContext();

    const shift = await Shift.findOne({ shiftId: params.shiftId }).lean();

    if (!shift) {
      return NextResponse.json(
        {
          message: "Shift not found.",
        },
        { status: 404 },
      );
    }

    if (!authContext.isAdmin) {
      const visibility = (shift as { visibility?: string }).visibility ?? "public";
      if (visibility === "invited") {
        const invitedList = ((shift as { invited?: string[] }).invited ?? []) as string[];
        if (!authContext.isAuthenticated || !authContext.userId || invitedList.indexOf(authContext.userId) < 0) {
          return NextResponse.json(
            {
              message: "You are not authorized to view this invited shift.",
            },
            { status: 403 },
          );
        }
      }
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

/**
 * DELETE /api/shift/[shiftId]
 * Deletes a shift by its shiftId.
 * Returns 404 if the shift does not exist, and 500 on error.
 */
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

/**
 * PATCH /api/shift/[shiftId]
 * Updates a shift by its shiftId.
 */
export async function PATCH(request: Request, { params }: IParams): Promise<NextResponse> {
  await connectDB();

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.dayId !== undefined) updateData.dayId = body.dayId;
    if (body.totalSlots !== undefined) updateData.totalSlots = Number(body.totalSlots);
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.invited !== undefined) updateData.invited = body.invited;

    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;

    if (body.date !== undefined) {
      const shiftDate = new Date(body.date as string);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      updateData.date = shiftDate;
      updateData.dayOfWeek = days[shiftDate.getDay()];
    }

    const shift = await Shift.findOneAndUpdate({ shiftId: params.shiftId }, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!shift) {
      return NextResponse.json({ message: "Shift not found." }, { status: 404 });
    }

    return NextResponse.json({ data: shift }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to update shift.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
