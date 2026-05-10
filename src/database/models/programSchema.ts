import mongoose, { Schema } from "mongoose";

type program = {
  imageURI: string;
  location: string;
  date: Date;
  duration: string;
  programName: string;
  programId: string;
  private: boolean;
  ghost_program?: boolean; // for programs only accessible by URL
};

const programSchema = new Schema<program>({
  imageURI: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: String, required: true },
  programName: { type: String, required: true },
  programId: { type: String, required: true },
  private: { type: Boolean, required: false, default: true },
  ghost_program: { type: Boolean, required: false, default: false },
});

const Program = mongoose.models["program"] || mongoose.model("program", programSchema, "program");

export default Program;
