import { redirect } from "next/navigation";
import OpportunitiesDashboard from "@/components/opportunities/OpportunitiesDashboard";
import connectDB from "@/database/db";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";
import Shift from "@/database/models/Shift";
import { getAuthContext } from "@/lib/authz";

export const dynamic = "force-dynamic";

type ProgramRecord = {
  programId: string;
  programName: string;
  location: string;
  imageURI: string;
  date: Date | string;
  duration: string;
};

type DayRecord = {
  dayId: string;
  programId: string;
  name: string;
  dayOfWeek: string;
  date: Date | string;
  startTime: string;
  endTime: string;
};

type ShiftRecord = {
  shiftId: string;
  dayId: string;
  name: string;
  dayOfWeek: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  location: string;
  totalSlots: number;
  visibility: "public" | "invited";
  description: string;
};

const serializeDate = (value: Date | string) => (value instanceof Date ? value.toISOString() : String(value));

export default async function OpportunitiesPage() {
  const { isAdmin } = await getAuthContext();

  if (!isAdmin) {
    redirect("/");
  }

  await connectDB();

  const [programs, days, shifts] = await Promise.all([
    Program.find({ ghost_program: false }).sort({ date: 1 }).lean<ProgramRecord[]>(),
    Day.find().sort({ date: 1, startTime: 1 }).lean<DayRecord[]>(),
    Shift.find().sort({ date: 1, startTime: 1 }).lean<ShiftRecord[]>(),
  ]);

  return (
    <OpportunitiesDashboard
      programs={programs.map((program) => ({
        ...program,
        date: serializeDate(program.date),
      }))}
      days={days.map((day) => ({
        ...day,
        date: serializeDate(day.date),
      }))}
      shifts={shifts.map((shift) => ({
        ...shift,
        date: serializeDate(shift.date),
      }))}
    />
  );
}
