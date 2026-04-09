import mongoose, { Schema } from "mongoose";

/* 
Use the "date" for the "dayOfWeek" field to determine the day of the week.
*/

type day = {
  name: string;
  dayOfWeek: string;
  date: Date;
  startTime: string;
  endTime: string;
  programId: string;
  dayId: string;
};

const daySchema = new Schema<day>({
  name: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  programId: { type: String, required: true },
  dayId: { type: String, required: true },
});

const Day = mongoose.models["day"] || mongoose.model("day", daySchema, "day");

export default Day;
