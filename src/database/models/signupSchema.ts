import mongoose, { Schema } from "mongoose";

/* 
figma shows that liability form is yes/no
so used a boolean for the waiver field. If it's true, the user has signed the waiver; if it's false, they haven't
 */

type signup = {
  shiftId: String;
  profileId: String;
  waiver: Boolean;
  timestamp: String;
};

const signupSchema = new Schema<signup>({
  shiftId: { type: String, required: true },
  profileId: { type: String, required: true },
  waiver: { type: Boolean, required: true },
  timestamp: { type: String, required: true },
});

const Signup = mongoose.models["signup"] || mongoose.model("signup", signupSchema, "signup");

export default Signup;
