// src/database/models/VolunteerApplication.ts
import mongoose, { Schema, Types, Model } from "mongoose";

export type Sex = "female" | "male" | "intersex" | "prefer_not_to_say" | "other";
export type ShirtSize = "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL";

export interface EmergencyContact {
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

export interface LiabilityWaiver {
  shiftId?: string; // optional: if you want to track which shift/event the annual waiver acceptance applies to
  accepted: boolean;
  acceptedAt?: Date;
  // annual renewal logic uses acceptedAt + expiresAt
  expiresAt?: Date;
}

export interface IVolunteer {
  // Basic bio
  name: string;
  email: string;
  phone: string;
  height: number;
  weight: number; // lbs (or kg)
  sex: Sex;
  birthday: Date;
  location: string;

  emergencyContact: EmergencyContact;

  skillsOrExperience: string;
  shirtSize: ShirtSize;
  interests: string;

  // Liability waiver logic
  liabilityWaiver: LiabilityWaiver[]; // must be accepted to sign up for any shift

  // Optional: screening / background check (third-party)
  backgroundCheck: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const LiabilityWaiverSchema = new Schema<LiabilityWaiver>(
  {
    shiftId: { type: String, required: false, trim: true },
    accepted: { type: Boolean, required: true },
    acceptedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { _id: false },
);

/**
 * Shirt size "10 hour logic"
 * You mentioned "Shirt size [with 10 hour logic]".
 * Typically this means: shirt is granted/required after 10 volunteer hours.
 * The application can store shirtSize regardless, but enforcement is business logic.
 * You can also track hours elsewhere (VolunteerHours), and only issue shirt when >= 10.
 */
const VolunteerSchema = new Schema<IVolunteer>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
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
