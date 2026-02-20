import mongoose, { Schema } from "mongoose";

type Project = {
  imageURI: string;
  location: string;
  date: Date;
  duration: string;
  programName: string;
  programId: string;
};

const programSchema = new Schema<Project>({
  imageURI: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: String, required: true },
  programName: { type: String, required: true },
  programId: { type: String, required: true },
});

// temporary model names
// waiting on finalized names
const Program = mongoose.models["Programs"] || mongoose.model("Programs", programSchema);

export default Program;
