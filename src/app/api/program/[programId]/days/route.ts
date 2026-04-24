import { NextResponse } from "next/server";
import connectDB from "@/database/db";
import Day from "@/database/models/daySchema"; // adjust if your file name differs

export async function GET(req: Request, context: { params: Promise<{ programId: string }> }) {
  const { programId } = await context.params;

  await connectDB();

  try {
    const events = await Day.find({ programId });

    return NextResponse.json({ days: events });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
