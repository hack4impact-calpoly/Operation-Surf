import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectDB, { client } from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import { getAuthContext } from "@/lib/authz";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-() ]{7,20}$/;
const zipcodeRegex = /^[0-9A-Za-z -]{3,12}$/;

type ApplicationBody = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  birthday: string;
  sex: "female" | "male" | "intersex" | "prefer_not_to_say" | "other";
  height: string | number;
  weight: string | number;
  shirtSize: "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL";
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyEmail: string;
  emergencyPhone: string;
  liabilityWaiverAccepted: boolean;
};

const splitName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

const normalizeBoolean = (value: unknown) => value === true || value === "true";

const validateApplication = (body: Partial<ApplicationBody>) => {
  const requiredStringFields: Array<keyof ApplicationBody> = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "zipcode",
    "birthday",
    "sex",
    "shirtSize",
    "emergencyFirstName",
    "emergencyLastName",
    "emergencyEmail",
    "emergencyPhone",
  ];

  for (const field of requiredStringFields) {
    if (typeof body[field] !== "string" || body[field]?.trim() === "") {
      return false;
    }
  }

  if (!emailRegex.test(String(body.email).trim())) return false;
  if (!emailRegex.test(String(body.emergencyEmail).trim())) return false;
  if (!phoneRegex.test(String(body.phone).trim())) return false;
  if (!phoneRegex.test(String(body.emergencyPhone).trim())) return false;
  if (!zipcodeRegex.test(String(body.zipcode).trim())) return false;

  const birthday = new Date(String(body.birthday));
  if (Number.isNaN(birthday.getTime())) return false;

  const height = Number(body.height);
  const weight = Number(body.weight);
  if (!Number.isFinite(height) || height <= 0) return false;
  if (!Number.isFinite(weight) || weight <= 0) return false;

  if (typeof body.liabilityWaiverAccepted !== "boolean") return false;

  return true;
};

async function getAuthUser(userId: string) {
  try {
    return await client
      .db()
      .collection("user")
      .findOne({ _id: new ObjectId(userId) });
  } catch {
    return null;
  }
}

function buildLocation(address: string, city: string, state: string, zipcode: string) {
  return `${address}, ${city}, ${state} ${zipcode}`.trim();
}

function buildUsername(email: string, userId: string, fallbackUsername?: unknown) {
  if (typeof fallbackUsername === "string" && fallbackUsername.trim() !== "") {
    return fallbackUsername.trim();
  }

  const emailPrefix = email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "volunteer";
  return `${emailPrefix}-${userId.slice(-6)}`;
}

export async function GET() {
  try {
    await connectDB();
    const authContext = await getAuthContext();

    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const volunteer = (await Volunteer.findOne({ userId: authContext.userId }).lean()) as Record<
      string,
      unknown
    > | null;
    const authNameParts = splitName(authContext.name ?? "");
    const volunteerNameParts = splitName(String(volunteer?.name ?? ""));
    const emergencyNameParts = splitName(
      String((volunteer?.emergencyContact as Record<string, unknown> | undefined)?.name ?? ""),
    );

    const birthday =
      volunteer?.birthday instanceof Date
        ? volunteer.birthday.toISOString().split("T")[0]
        : volunteer?.birthday
          ? new Date(String(volunteer.birthday)).toISOString().split("T")[0]
          : "";

    const liabilityWaiver = Array.isArray(volunteer?.liabilityWaiver)
      ? (volunteer?.liabilityWaiver as Array<Record<string, unknown>>)
      : [];

    const applicationWaiver =
      liabilityWaiver.find((waiver) => String(waiver.shiftId) === "volunteer-application") ??
      liabilityWaiver.find((waiver) => waiver.accepted === true);

    return NextResponse.json(
      {
        application: {
          firstName: volunteerNameParts.firstName || authNameParts.firstName,
          lastName: volunteerNameParts.lastName || authNameParts.lastName,
          email: String(volunteer?.email ?? authContext.email ?? ""),
          phone: String(volunteer?.phone ?? ""),
          address: String(volunteer?.address ?? ""),
          city: String(volunteer?.city ?? ""),
          state: String(volunteer?.state ?? ""),
          zipcode: String(volunteer?.zipcode ?? ""),
          birthday,
          sex: String(volunteer?.sex ?? ""),
          height: volunteer?.height ? String(volunteer.height) : "",
          weight: volunteer?.weight ? String(volunteer.weight) : "",
          shirtSize: String(volunteer?.shirtSize ?? ""),
          emergencyFirstName: emergencyNameParts.firstName,
          emergencyLastName: emergencyNameParts.lastName,
          emergencyEmail: String((volunteer?.emergencyContact as Record<string, unknown> | undefined)?.email ?? ""),
          emergencyPhone: String((volunteer?.emergencyContact as Record<string, unknown> | undefined)?.phone ?? ""),
          liabilityWaiverAccepted: Boolean(applicationWaiver?.accepted),
        },
        hasExistingProfile: Boolean(volunteer),
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to load volunteer application.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const authContext = await getAuthContext();

    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as Partial<ApplicationBody>;
    const normalizedBody: Partial<ApplicationBody> = {
      ...body,
      liabilityWaiverAccepted: normalizeBoolean(body.liabilityWaiverAccepted),
    };

    if (!validateApplication(normalizedBody)) {
      return NextResponse.json({ message: "Invalid volunteer application." }, { status: 400 });
    }

    const firstName = String(normalizedBody.firstName).trim();
    const lastName = String(normalizedBody.lastName).trim();
    const email = String(normalizedBody.email).trim().toLowerCase();
    const phone = String(normalizedBody.phone).trim();
    const address = String(normalizedBody.address).trim();
    const city = String(normalizedBody.city).trim();
    const state = String(normalizedBody.state).trim();
    const zipcode = String(normalizedBody.zipcode).trim();
    const birthday = new Date(String(normalizedBody.birthday));
    const height = Number(normalizedBody.height);
    const weight = Number(normalizedBody.weight);
    const shirtSize = String(normalizedBody.shirtSize).trim();
    const sex = String(normalizedBody.sex).trim();
    const emergencyFirstName = String(normalizedBody.emergencyFirstName).trim();
    const emergencyLastName = String(normalizedBody.emergencyLastName).trim();
    const emergencyEmail = String(normalizedBody.emergencyEmail).trim().toLowerCase();
    const emergencyPhone = String(normalizedBody.emergencyPhone).trim();
    const liabilityWaiverAccepted = Boolean(normalizedBody.liabilityWaiverAccepted);

    const existingVolunteer = (await Volunteer.findOne({ userId: authContext.userId }).lean()) as Record<
      string,
      unknown
    > | null;
    const authUser = await getAuthUser(authContext.userId);

    const duplicateVolunteer = await Volunteer.findOne({
      email,
      userId: { $ne: authContext.userId },
    }).lean();

    const duplicateAuthUser = await client
      .db()
      .collection("user")
      .findOne({
        email,
        _id: { $ne: new ObjectId(authContext.userId) },
      });

    if (duplicateVolunteer || duplicateAuthUser) {
      return NextResponse.json(
        { message: "Account with this email already exists. Please enter another email." },
        { status: 409 },
      );
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const emergencyName = `${emergencyFirstName} ${emergencyLastName}`.trim();
    const location = buildLocation(address, city, state, zipcode);
    const username = buildUsername(email, authContext.userId, existingVolunteer?.username ?? authUser?.username);

    const existingLiabilityWaivers = Array.isArray(existingVolunteer?.liabilityWaiver)
      ? (existingVolunteer.liabilityWaiver as Array<Record<string, unknown>>)
      : [];

    const liabilityWaiver = [
      {
        shiftId: "volunteer-application",
        accepted: liabilityWaiverAccepted,
        acceptedAt: liabilityWaiverAccepted ? new Date() : undefined,
      },
      ...existingLiabilityWaivers.filter((waiver) => String(waiver.shiftId) !== "volunteer-application"),
    ];

    const volunteerPayload = {
      userId: authContext.userId,
      name: fullName,
      username,
      email,
      phone,
      address,
      city,
      state,
      zipcode,
      location,
      birthday,
      sex,
      height,
      weight,
      shirtSize,
      emergencyContact: {
        name: emergencyName,
        relationship: String(
          (existingVolunteer?.emergencyContact as Record<string, unknown> | undefined)?.relationship ?? "",
        ).trim(),
        phone: emergencyPhone,
        email: emergencyEmail,
      },
      hours: Number(existingVolunteer?.hours ?? 0),
      volunteerCount: Number(existingVolunteer?.volunteerCount ?? 0),
      skillsOrExperience: String(existingVolunteer?.skillsOrExperience ?? "Not provided"),
      interests: String(existingVolunteer?.interests ?? "Not provided"),
      notes: String(existingVolunteer?.notes ?? ""),
      liabilityWaiver,
      backgroundCheck: Boolean(existingVolunteer?.backgroundCheck ?? false),
    };

    const volunteer = await Volunteer.findOneAndUpdate(
      { userId: authContext.userId },
      { $set: volunteerPayload },
      { upsert: true, new: true, runValidators: true },
    );

    await client
      .db()
      .collection("user")
      .updateOne(
        { _id: new ObjectId(authContext.userId) },
        {
          $set: {
            name: fullName,
            email,
            updatedAt: new Date(),
          },
        },
      );

    return NextResponse.json({ volunteer }, { status: existingVolunteer ? 200 : 201 });
  } catch (err) {
    return NextResponse.json(
      {
        message: "Failed to save volunteer application.",
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      },
      { status: 500 },
    );
  }
}
