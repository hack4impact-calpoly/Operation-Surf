import { notFound } from "next/navigation";
import connectDB from "@/database/db";
import Volunteer from "@/database/models/volunteerSchema";
import Signup from "@/database/models/signupSchema";
import Day from "@/database/models/daySchema";
import Program from "@/database/models/programSchema";
import { getAuthContext } from "@/lib/authz";
import AdminUserDashboard from "@/components/AdminUserDashboard";

type AdminUserPageProps = {
  params: { userId: string };
};

type VolunteerRecord = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  notes?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
};

type RegisteredEvent = {
  signupId: string;
  shiftId: string;
  name: string;
  date: string | null;
  status: string;
};

// returns the volunteer in question
async function getVolunteer(userId: string): Promise<VolunteerRecord | null> {
  const volunteer = await Volunteer.findOne({ userId }).lean<VolunteerRecord | null>();
  return volunteer ?? null;
}

// returns all the users registered events
async function getRegisteredEvents(profileId: string): Promise<RegisteredEvent[]> {
  const signups = await Signup.find({ profileId })
    .sort({ timestamp: -1 })
    .lean<Array<{ signupId: string; shiftId: string }>>();
  if (signups.length === 0) return [];

  const shiftIds = signups.map((s) => s.shiftId);
  const shifts = await Day.find({ dayId: { $in: shiftIds } }).lean<
    Array<{ dayId: string; name?: string; date?: Date | string; programId: string }>
  >();
  const shiftById = new Map(shifts.map((shift) => [shift.dayId, shift]));

  return signups.map((signup) => {
    const shift = shiftById.get(signup.shiftId);
    const date = shift?.date ? (shift.date instanceof Date ? shift.date.toISOString() : shift.date) : null;
    return {
      signupId: signup.signupId,
      shiftId: signup.shiftId,
      name: shift?.name ?? "Unknown shift",
      date,
      // TODO: signup schema has no status field yet; hardcoded until cancellation flow exists.
      status: "Confirmed",
    };
  });
}

// gathers data, calls AdminUserDashboard
export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const { isAdmin } = await getAuthContext();
  if (!isAdmin) {
    notFound();
  }

  const { userId } = params;
  if (!userId) {
    notFound();
  }

  await connectDB();

  const volunteer = await getVolunteer(userId);
  if (!volunteer) {
    notFound();
  }

  const registeredEvents = await getRegisteredEvents(userId);

  const profile = {
    userId: volunteer.userId,
    fullName: volunteer.name,
    email: volunteer.email,
    phone: volunteer.phone,
    location: volunteer.location,
    emergencyContact: volunteer.emergencyContact
      ? [volunteer.emergencyContact.name, volunteer.emergencyContact.phone, volunteer.emergencyContact.email]
          .filter(Boolean)
          .join(" · ")
      : "",
    notes: volunteer.notes ?? "",
  };

  return <AdminUserDashboard profile={profile} registeredEvents={registeredEvents} />;
}
