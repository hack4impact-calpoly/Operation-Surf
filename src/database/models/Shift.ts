import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ShiftSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dayOfWeek: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    totalSlots: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    shiftId: { type: String, required: true, unique: true, trim: true },
    dayId: { type: String, required: true, trim: true },
    invited: { type: [String], required: true }, // array of volunteerIds to check if someone is invited to the shift
    description: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  },
);

export type ShiftDocument = InferSchemaType<typeof ShiftSchema>;

const Shift: Model<ShiftDocument> =
  (mongoose.models.Shift as Model<ShiftDocument>) || mongoose.model<ShiftDocument>("Shift", ShiftSchema);

export default Shift;
