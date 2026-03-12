import mongoose, { Schema } from "mongoose";

/* 
figma shows that liability form is yes/no
so used a boolean for the waiver field. If it's true, the user has signed the waiver; if it's false, they haven't

Using Date for timestamp because it will automatically store the date and time when the signup is created, which can be useful for tracking when users signed up for shifts.
 */

type signup = {
  shiftId: String;
  profileId: String;
  waiver: Boolean;
  timestamp: Date;
};

const signupSchema = new Schema<signup>({
  shiftId: { type: String, required: true },
  profileId: { type: String, required: true },
  waiver: { type: Boolean, required: true },
  timestamp: { type: Date, required: true },
});

const Signup = mongoose.models["signup"] || mongoose.model("signup", signupSchema, "signup");

export default Signup;
