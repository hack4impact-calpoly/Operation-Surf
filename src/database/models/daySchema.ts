import mongoose, { Schema } from "mongoose";

/* 
Use the "date" for the "dayOfWeek" field to determine the day of the week. This is because the "dayOfWeek" field is currently a Date type, which can be used to extract the day of the week. The "date" field can be used to determine the specific date of the event.
*/

type day = {
  name: string;
  dayOfWeek: Date;
  date: Date;
  startTime: string;
  endTime: string;
  programId: string;
  eventId: string;
};

const daySchema = new Schema<day>({
  name: { type: String, required: true },
  dayOfWeek: { type: Date, required: true },
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
