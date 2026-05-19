"use client";

import { useEffect, useMemo, useState } from "react";
import Dashboard from "@/components/Dashboard";
import { authClient } from "@/lib/auth-client";
import styles from "@/styles/Dashboard.module.css";

type VolunteerResponse = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
};

type ApiShift = {
  shiftId: string;
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
};

type ApiSignup = {
  signupId: string;
  shiftId: string;
  profileId: string;
  waiver: boolean;
  timestamp: string;
};

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

type Profile = {
  profileId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  emergencyContact: EmergencyContact;
};

type Shift = {
  shiftId: string;
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
};

type RegisteredDay = {
  signupId: string;
  shiftId: string;
  name: string;
  date: string;
  status: string;
};

function formatRegisteredDate(dateStr: string): string {
  const dateOnly = dateStr.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildEmergencyContact(volunteer: VolunteerResponse): EmergencyContact {
  return {
    name: volunteer.emergencyContact?.name ?? "",
    relationship: volunteer.emergencyContact?.relationship ?? "",
    phone: volunteer.emergencyContact?.phone ?? "",
    email: volunteer.emergencyContact?.email ?? "",
  };
}

export default function DashboardPage() {
  const { data: session, isPending: loadingSession } = authClient.useSession();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [signups, setSignups] = useState<ApiSignup[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [loadingDays, setLoadingDays] = useState(true);

  const [pendingSignupIds, setPendingSignupIds] = useState<Set<string>>(new Set());

  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;

  // Fetch dashboard data using existing backend routes.
  useEffect(() => {
    if (loadingSession) {
      return;
    }

    if (!userId) {
      setLoadingProfile(false);
      setLoadingShifts(false);
      setLoadingDays(false);
      setError("You must be signed in to view your dashboard.");
      return;
    }

    async function loadDashboardData() {
      try {
        setError(null);
        setLoadingProfile(true);
        setLoadingShifts(true);
        setLoadingDays(true);

        const [profileRes, shiftsRes, signupsRes] = await Promise.all([
          fetch(`/api/volunteer/${userId}`),
          fetch("/api/shift"),
          fetch(`/api/signup?profileId=${userId}`),
        ]);

        if (!profileRes.ok) {
          throw new Error("Failed to load profile.");
        }

        if (!shiftsRes.ok) {
          throw new Error("Failed to load shifts.");
        }

        if (!signupsRes.ok) {
          throw new Error("Failed to load registered days.");
        }

        const volunteer: VolunteerResponse = await profileRes.json();
        const shiftsJson: { data: ApiShift[] } = await shiftsRes.json();
        const signupsJson: { signups: ApiSignup[] } = await signupsRes.json();

        setProfile({
          profileId: volunteer.userId,
          fullName: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          location: volunteer.location,
          emergencyContact: buildEmergencyContact(volunteer),
        });

        setShifts(
          shiftsJson.data.map((shift) => ({
            shiftId: shift.shiftId,
            name: shift.name,
            dayOfWeek: shift.dayOfWeek,
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
          })),
        );

        setSignups(signupsJson.signups);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong loading the dashboard.");
      } finally {
        setLoadingProfile(false);
        setLoadingShifts(false);
        setLoadingDays(false);
      }
    }

    loadDashboardData();
  }, [loadingSession, userId]);

  // Build a fast lookup set so each shift card knows whether the user is registered.
  const registeredShiftIds = useMemo(() => {
    return new Set(signups.map((signup) => signup.shiftId));
  }, [signups]);

  // Build the sidebar registered days by joining signups to shifts in the frontend.
  const registeredDays = useMemo<RegisteredDay[]>(() => {
    return signups.map((signup) => {
      const matchingShift = shifts.find((shift) => shift.shiftId === signup.shiftId);

      return {
        signupId: signup.signupId,
        shiftId: signup.shiftId,
        name: matchingShift?.name ?? "Registered Day",
        date: matchingShift?.date ? formatRegisteredDate(matchingShift.date) : "Date unavailable",
        status: "Confirmed",
      };
    });
  }, [signups, shifts]);

  async function handleSignUp(shiftId: string) {
    if (!userId) {
      setError("You must be signed in to sign up for a day.");
      return;
    }

    if (registeredShiftIds.has(shiftId) || pendingSignupIds.has(shiftId)) {
      return;
    }

    setPendingSignupIds((current) => {
      const next = new Set(current);
      next.add(shiftId);
      return next;
    });

    try {
      setError(null);

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftId,
          profileId: userId,
          waiver: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to sign up for day.");
      }

      const json: { signup: ApiSignup } = await res.json();

      setSignups((current) => {
        if (current.some((signup) => signup.shiftId === shiftId)) {
          return current;
        }

        return [...current, json.signup];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong signing up.");
    } finally {
      setPendingSignupIds((current) => {
        const next = new Set(current);
        next.delete(shiftId);
        return next;
      });
    }
  }

  async function handleCancel(signupId: string) {
    try {
      setError(null);

      const res = await fetch(`/api/signup/${signupId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to cancel registration.");
      }

      // Remove the signup locally so both sections stay in sync immediately.
      setSignups((current) => current.filter((signup) => signup.signupId !== signupId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong canceling registration.");
    }
  }

  async function handleSaveProfile(updatedProfile: Profile) {
    if (!userId) {
      throw new Error("You must be signed in to update your profile.");
    }

    const res = await fetch(`/api/volunteer/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updatedProfile.fullName,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        location: updatedProfile.location,
        emergencyContact: {
          name: updatedProfile.emergencyContact.name,
          relationship: updatedProfile.emergencyContact.relationship,
          phone: updatedProfile.emergencyContact.phone,
          email: updatedProfile.emergencyContact.email,
        },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message ?? "Failed to update profile.");
    }

    setProfile(updatedProfile);
  }

  return (
    <>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <Dashboard
        profile={profile}
        shifts={shifts}
        registeredDays={registeredDays}
        registeredShiftIds={registeredShiftIds}
        loadingProfile={loadingProfile || loadingSession}
        loadingShifts={loadingShifts || loadingSession}
        loadingDays={loadingDays || loadingSession}
        onSignUp={handleSignUp}
        onCancel={handleCancel}
        onSaveProfile={handleSaveProfile}
      />
    </>
  );
}
