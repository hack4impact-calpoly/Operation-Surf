"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";

import GreyNavbar from "@/components/GreyNavbar";
import ShiftDetails from "@/components/shift-details/ShiftDetails";
import { authClient } from "@/lib/auth-client";
import styles from "@/styles/ShiftDetails.module.css";

import { Roboto_Slab } from "next/font/google";
import { Inter } from "next/font/google";

// allow interchangeability between the two fonts
const roboto = Roboto_Slab({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

type Day = {
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  programId: string;
  dayId: string;
  private: boolean;
  location?: string;
  description?: string;
};

type Shift = {
  name: string;
  description: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  location: string;
  address?: string;
  locationInfo?: string;
  byoDescription?: string;
  mapLink?: string;
  shiftId: string;
  dayId: string;
  visibility: "public" | "invited";
  invited: string[];
};

type ApiSignup = {
  signupId: string;
  shiftId: string;
  profileId: string;
  waiver: boolean;
  timestamp: string;
};

export default function DayDetailsPage() {
  const params = useParams<{ dayId: string }>();
  const dayId = params.dayId;

  const { data: session, isPending: loadingSession } = authClient.useSession();
  const userId = session?.user?.id;

  const [day, setDay] = useState<Day | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [signups, setSignups] = useState<ApiSignup[]>([]);
  const [allSignups, setAllSignups] = useState<ApiSignup[]>([]);
  const [pendingSignupIds, setPendingSignupIds] = useState<Set<string>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    if (loadingSession) {
      return;
    }

    if (!userId) {
      showError("You must be signed in to view shift details.");
      setLoadingDetails(false);
      return;
    }

    async function loadDayDetails() {
      try {
        setError(null);
        setLoadingDetails(true);

        const [dayRes, shiftsRes, signupsRes, allSignupsRes] = await Promise.all([
          fetch(`/api/day/${dayId}`),
          fetch("/api/shift"),
          fetch(`/api/signup?profileId=${userId}`),
          fetch("/api/signup"),
        ]);

        if (!dayRes.ok) {
          throw new Error("Failed to load day details.");
        }

        if (!shiftsRes.ok) {
          throw new Error("Failed to load shifts.");
        }

        if (!signupsRes.ok) {
          throw new Error("Failed to load registered shifts.");
        }

        if (!allSignupsRes.ok) {
          throw new Error("Failed to load shift signup counts.");
        }

        const dayJson: { day: Day } = await dayRes.json();
        const shiftsJson: { data: Shift[] } = await shiftsRes.json();
        const signupsJson: { signups: ApiSignup[] } = await signupsRes.json();
        const allSignupsJson: { signups: ApiSignup[] } = await allSignupsRes.json();

        setDay(dayJson.day);
        setShifts(shiftsJson.data.filter((shift) => shift.dayId === dayId));
        setSignups(signupsJson.signups);
        setAllSignups(allSignupsJson.signups);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong loading shift details.");
      } finally {
        setLoadingDetails(false);
      }
    }

    loadDayDetails();
  }, [dayId, loadingSession, userId]);

  // scroll to top of page when error banner is triggered
  // (for errors that use showError)
  useEffect(() => {
    if (error) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [error, errorCount]);

  const registeredShiftIds = useMemo(() => {
    return new Set(signups.map((signup) => signup.shiftId));
  }, [signups]);

  // for calculating and displaying how many spots available
  const shiftSignupCounts = useMemo(() => {
    const counts = new Map<string, number>();

    allSignups.forEach((signup) => {
      counts.set(signup.shiftId, (counts.get(signup.shiftId) ?? 0) + 1);
    });

    return counts;
  }, [allSignups]);

  function showError(message: string) {
    setError(message);
    setErrorCount((current) => current + 1);
  }

  // signup handler
  async function handleSignUp(shiftIds: string[]) {
    if (!userId) {
      setError("You must be signed in to sign up for a shift.");
      return;
    }

    const newShiftIds = shiftIds.filter(
      (shiftId) => !registeredShiftIds.has(shiftId) && !pendingSignupIds.has(shiftId),
    );

    if (newShiftIds.length === 0) {
      showError("You are already signed up for the selected shift(s).");
      return;
    }

    setPendingSignupIds((current) => {
      const next = new Set(current);

      for (const shiftId of newShiftIds) {
        next.add(shiftId);
      }

      return next;
    });

    try {
      setError(null);

      const signupResponses = await Promise.all(
        newShiftIds.map((shiftId) =>
          fetch("/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shiftId,
              profileId: userId,
              waiver: true,
            }),
          }),
        ),
      );

      const failedResponse = signupResponses.find((res) => !res.ok);

      if (failedResponse) {
        const errorData = await failedResponse.json().catch(() => null);
        throw new Error(errorData?.message ?? "Failed to sign up for shift.");
      }

      const signupJsons: { signup: ApiSignup }[] = await Promise.all(signupResponses.map((res) => res.json()));

      setSignups((current) => {
        const existingShiftIds = new Set(current.map((signup) => signup.shiftId));

        const newSignups = signupJsons
          .map((json) => json.signup)
          .filter((signup) => !existingShiftIds.has(signup.shiftId));

        return [...current, ...newSignups];
      });

      // make spots available instantly calculate
      setAllSignups((current) => {
        const existingSignupIds = new Set(current.map((signup) => signup.signupId));

        const newSignups = signupJsons
          .map((json) => json.signup)
          .filter((signup) => !existingSignupIds.has(signup.signupId));

        return [...current, ...newSignups];
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Something went wrong signing up.");
    } finally {
      setPendingSignupIds((current) => {
        const next = new Set(current);

        for (const shiftId of newShiftIds) {
          next.delete(shiftId);
        }

        return next;
      });
    }
  }

  return (
    <div className={inter.className}>
      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      {loadingDetails || loadingSession ? (
        <main className={styles.page}>
          <GreyNavbar />

          <div className={styles.content}>
            <p className={styles.statusMsg} role="status">
              Loading shift details...
            </p>
          </div>
        </main>
      ) : day ? (
        <ShiftDetails
          dayId={dayId}
          day={day}
          shifts={shifts}
          registeredShiftIds={registeredShiftIds}
          pendingSignupIds={pendingSignupIds}
          shiftSignupCounts={shiftSignupCounts}
          onSignUp={handleSignUp}
        />
      ) : (
        <main className={styles.page}>
          <GreyNavbar />

          <div className={styles.content}>
            <p className={styles.statusMsg}>No day details available.</p>
          </div>
        </main>
      )}
    </div>
  );
}
