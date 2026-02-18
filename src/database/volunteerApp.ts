// src/database/models/VolunteerApplication.ts
import mongoose, { Schema, Types, Model } from "mongoose";

export type Sex = "female" | "male" | "intersex" | "prefer_not_to_say" | "other";
export type ShirtSize =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "2XL"
  | "3XL"
  | "4XL"
  | "5XL";

export type BackgroundCheckStatus =
  | "not_requested"
  | "requested"
  | "in_progress"
  | "clear"
  | "consider"
  | "disqualified"
  | "expired";

export interface LiabilityWaiverAcceptance {
  accepted: boolean;
  acceptedAt?: Date;
  waiverVersion?: string; // keep track if your waiver text changes
  ipAddress?: string;
  userAgent?: string;
  // annual renewal logic uses acceptedAt + expiresAt
  expiresAt?: Date;
}

export interface ShiftWaiverAcceptance extends LiabilityWaiverAcceptance {
  shiftId: string; // the shift (or event) the waiver applies to
}

export interface EmergencyContact {
  name: string;
  relationship?: string;
  phone: string;
  email?: string;
}

export interface IVolunteerApplication {
  // Basic bio
  name: string;
  email: string;
  phone: string;
  height: number; // inches (or change to cm; just be consistent)
  weight: number; // lbs (or kg)
  sex: Sex;
  birthday: Date;
  location: string;

  emergencyContact: EmergencyContact;

  skillsOrExperience: string;
  shirtSize: ShirtSize;
  interests: string[];

  // Liability waiver logic
  liabilityWaiverAnnual: LiabilityWaiverAcceptance; // must be accepted to sign up for any shift
  liabilityWaiverPerShift: ShiftWaiverAcceptance[]; // optional: if you enforce waiver per shift/event

  // Optional: screening / background check (third-party)
  backgroundCheck?: {
    provider?: string; // e.g. "Checkr", "Sterling", "LocalVendor"
    status: BackgroundCheckStatus;
    referenceId?: string; // id from provider
    lastUpdatedAt?: Date;
    notes?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<EmergencyContact>(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: false, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: false, trim: true, lowercase: true },
  },
  { _id: false }
);

const LiabilityWaiverAcceptanceSchema = new Schema<LiabilityWaiverAcceptance>(
  {
    accepted: { type: Boolean, required: true, default: false },
    acceptedAt: { type: Date, required: false },
    waiverVersion: { type: String, required: false },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
    expiresAt: { type: Date, required: false },
  },
  { _id: false }
);

const ShiftWaiverAcceptanceSchema = new Schema<ShiftWaiverAcceptance>(
  {
    shiftId: { type: String, required: true },
    accepted: { type: Boolean, required: true, default: false },
    acceptedAt: { type: Date, required: false },
    waiverVersion: { type: String, required: false },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
    expiresAt: { type: Date, required: false },
  },
  { _id: false }
);

/**
 * Shirt size "10 hour logic"
 * You mentioned "Shirt size [with 10 hour logic]".
 * Typically this means: shirt is granted/required after 10 volunteer hours.
 * The application can store shirtSize regardless, but enforcement is business logic.
 * You can also track hours elsewhere (VolunteerHours), and only issue shirt when >= 10.
 */
const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
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
      enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
    },

    interests: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: "Interests must include at least one item.",
      },
    },

    // Waivers
    liabilityWaiverAnnual: { type: LiabilityWaiverAcceptanceSchema, required: true },
    liabilityWaiverPerShift: { type: [ShiftWaiverAcceptanceSchema], required: true, default: [] },

    backgroundCheck: {
      provider: { type: String, required: false },
      status: {
        type: String,
        required: true,
        default: "not_requested",
        enum: [
          "not_requested",
          "requested",
          "in_progress",
          "clear",
          "consider",
          "disqualified",
          "expired",
        ],
      },
      referenceId: { type: String, required: false },
      lastUpdatedAt: { type: Date, required: false },
      notes: { type: String, required: false },
    },
  },
  { timestamps: true }
);

/**
 * Helpful indexes (optional)
 */
VolunteerApplicationSchema.index({ email: 1 }, { unique: false });
VolunteerApplicationSchema.index({ createdAt: -1 });

export const VolunteerApplication: Model<IVolunteerApplication> =
  mongoose.models.VolunteerApplication ||
  mongoose.model<IVolunteerApplication>("VolunteerApplication", VolunteerApplicationSchema);

/**
 * --- Waiver logic helpers (pure functions) ---
 * You can call these from your shift signup flow.
 */

export function isAnnualWaiverValid(app: IVolunteerApplication, now = new Date()): boolean {
  const w = app.liabilityWaiverAnnual;
  if (!w?.accepted || !w.acceptedAt) return false;

  // If expiresAt is stored, use it; otherwise compute 1 year from acceptedAt.
  const expires = w.expiresAt ?? new Date(w.acceptedAt.getTime() + 365 * 24 * 60 * 60 * 1000);
  return now <= expires;
}

export function hasShiftWaiver(app: IVolunteerApplication, shiftId: string): boolean {
  return app.liabilityWaiverPerShift?.some((w) => w.shiftId === shiftId && w.accepted);
}
