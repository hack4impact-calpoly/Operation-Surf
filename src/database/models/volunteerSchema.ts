// src/database/models/VolunteerApplication.ts
import mongoose, { Schema, Types, Model } from "mongoose";

type Sex = "female" | "male" | "intersex" | "prefer_not_to_say" | "other";
type ShirtSize = "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL";

interface EmergencyContact {
  name: string;
  relationship?: string;
  phone: string;
  email: string;
}

const EmergencyContactSchema = new Schema<EmergencyContact>({
  name: { type: String, required: true, trim: true },
  relationship: { type: String, required: false, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
});

interface LiabilityWaiver {
  shiftId: string;
  accepted: boolean;
  acceptedAt?: Date;
  // annual renewal logic uses acceptedAt + expiresAt
  expiresAt?: Date;
}

interface IVolunteer {
  // Basic bio
  userId: string;
  name: string;
  username: string;
  email: string;
  phone: string;

  // ht/wt in cm
  height: number;
  weight: number;
  sex: Sex;
  birthday: Date;
  location: string;

  emergencyContact: EmergencyContact;

  skillsOrExperience: string;
  shirtSize: ShirtSize;
  interests: string;

  // Liability waiver logic
  liabilityWaiver: LiabilityWaiver[]; // must be accepted to sign up for any shift

  backgroundCheck: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const LiabilityWaiverSchema = new Schema<LiabilityWaiver>(
  {
    shiftId: { type: String, required: true, trim: true },
    accepted: { type: Boolean, required: true },
    acceptedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { _id: false },
);

const VolunteerSchema = new Schema<IVolunteer>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: { type: String, required: true, trim: true },

    height: { type: Number, required: true, min: 1 },
    weight: { type: Number, required: true, min: 1 },

    sex: {
      type: String,
      required: true,
      enum: ["female", "male", "intersex", "prefer_not_to_say", "other"],
    },

    birthday: { type: Date, required: true },
    location: { type: String, required: true, trim: true },

    emergencyContact: { type: EmergencyContactSchema, required: true },

    skillsOrExperience: { type: String, required: true, trim: true },

    shirtSize: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    },

    interests: { type: String, required: true },

    // Waivers
    liabilityWaiver: { type: [LiabilityWaiverSchema], required: true },

    backgroundCheck: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

const Volunteer = mongoose.models["user_data"] || mongoose.model("user_data", VolunteerSchema, "user_data");

export default Volunteer;
