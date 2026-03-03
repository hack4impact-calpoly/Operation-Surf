import mongoose, { Schema } from "mongoose";

type program = {
  imageURI: string;
  location: string;
  date: Date;
  duration: string;
  programName: string;
  programId: string;
};

const programSchema = new Schema<program>({
  imageURI: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: String, required: true },
  programName: { type: String, required: true },
  programId: { type: String, required: true },
});

const Program = mongoose.models["program_data"] || mongoose.model("program_data", programSchema, "program_data");

export default Program;
