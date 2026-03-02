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
  eventId: string;
};

const daySchema = new Schema<day>({
  name: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  programId: { type: String, required: true },
  eventId: { type: String, required: true },
});

/* 
"event" term has changed to "day"
MongoDB still has this as event_data, but from now on
events will be referred to as days in the codebase.
*/

const Day = mongoose.models["event_data"] || mongoose.model("event_data", daySchema, "event_data");

export default Day;
