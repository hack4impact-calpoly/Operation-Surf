import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import Program from "@/database/models/programSchema";
import { getAuthContext } from "@/lib/authz";

/**
 * GET /api/program/[programId]
 * Retrieves a program by its programId.
 * - Returns 404 if the program is missing.
 * - Returns 404 for private or ghost programs when the caller is not authenticated.
 * - Returns 500 on unexpected errors.
 */

type IParams = {
  params: {
    programId: string;
  };
};

export async function GET(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();
  const authContext = await getAuthContext();

  const { programId } = params;

  try {
    const program = await Program.findOne({ programId: programId });
    // check if program exists
    if (!program) {
      return NextResponse.json(
        {
          message: "Program not found.",
        },
        { status: 404 },
      );
    }

    // Hide private or ghosted programs from unauthenticated users.
    if ((program.private || program.ghost_program) && !authContext.isAuthenticated) {
      return NextResponse.json(
        {
          message: "Program not found.",
        },
        { status: 404 },
      );
    }

    // if program exists, return it
    return NextResponse.json(
      {
        program: program,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching program:", err);
    return NextResponse.json(
      {
        message: "Failed to fetch program.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/program/[programId]
 * Deletes a program by its programId.
 * Returns 404 if the program does not exist and 500 on error.
 */
export async function DELETE(request: Request, { params }: IParams): Promise<NextResponse> {
  // Attempt to connect to the database
  await connectDB();

  const { programId } = params;

  try {
    const program = await Program.findOneAndDelete({ programId: programId });
    // check if program exists
    if (!program) {
      return NextResponse.json({ message: "Program not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Program deleted successfully.",
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to delete program.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/program/[programId]
 * Updates a program by its programId.
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

    if (body.imageURI !== undefined) updateData.imageURI = body.imageURI;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.date !== undefined) updateData.date = new Date(body.date as string);
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.programName !== undefined) updateData.programName = body.programName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.private !== undefined) updateData.private = body.private;
    if (body.ghost_program !== undefined) updateData.ghost_program = body.ghost_program;

    const program = await Program.findOneAndUpdate({ programId: params.programId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!program) {
      return NextResponse.json({ message: "Program not found." }, { status: 404 });
    }

    return NextResponse.json({ program }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to update program.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
