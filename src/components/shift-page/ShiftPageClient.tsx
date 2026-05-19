"use client";

import { useEffect, useState } from "react";
import ShiftCardList from "@/components/shift-card/ShiftCardList";
import type { ShiftCardProps } from "@/components/shift-card/ShiftCard";
import styles from "@/styles/ShiftPage.module.css";

type ShiftApiResponse = {
  data: Array<{
    shiftId: string;
    name: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    mapLink?: string;
    totalSlots: number;
  }>;
};

type SignupApiResponse = {
  signups: Array<{
    signupId: string;
    shiftId: string;
    profileId: string;
  }>;
};

function formatShiftDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ShiftPageClient() {
  const [shifts, setShifts] = useState<ShiftCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShifts() {
      try {
        const [shiftResponse, signupResponse] = await Promise.all([
          fetch("/api/shift", { cache: "no-store" }),
          fetch("/api/signup", { cache: "no-store" }),
        ]);

        if (!shiftResponse.ok) {
          throw new Error(`Failed to load shifts: ${shiftResponse.status}`);
        }

        if (!signupResponse.ok) {
          throw new Error(`Failed to load signups: ${signupResponse.status}`);
        }

        const [shiftJson, signupJson] = (await Promise.all([shiftResponse.json(), signupResponse.json()])) as [
          ShiftApiResponse,
          SignupApiResponse,
        ];

        const signupCountsByShift = new Map<string, number>();
        signupJson.signups.forEach((signup) => {
          signupCountsByShift.set(signup.shiftId, (signupCountsByShift.get(signup.shiftId) ?? 0) + 1);
        });

        const cardData: ShiftCardProps[] = shiftJson.data.map((shift) => ({
          id: shift.shiftId,
          name: shift.name,
          description: shift.description ?? "",
          dateRange: formatShiftDate(shift.date),
          timeRange: `${shift.startTime} - ${shift.endTime}`,
          location: shift.location,
          mapLink: shift.mapLink,
          spotsTaken: signupCountsByShift.get(shift.shiftId) ?? 0,
          spotsTotal: shift.totalSlots ?? 0,
        }));

        setShifts(cardData);
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else {
          setError("An unexpected error occurred while loading shifts.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchShifts();
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Admin Check-In</p>
          <h1 className={styles.title}>Available Shifts</h1>
          <p className={styles.subtitle}>Volunteer rosters by scheduled shift.</p>
        </div>
      </section>

      <section className={styles.content} aria-label="Available shifts">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Upcoming Shifts</h2>
            <p className={styles.sectionMeta}>
              {isLoading ? "Loading current schedule" : `${shifts.length} ${shifts.length === 1 ? "shift" : "shifts"}`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingGrid} aria-label="Loading shifts">
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : error ? (
          <div className={`${styles.statePanel} ${styles.errorPanel}`} role="alert">
            {error}
          </div>
        ) : shifts.length === 0 ? (
          <div className={styles.statePanel}>No shifts available.</div>
        ) : (
          <ShiftCardList shifts={shifts} />
        )}
      </section>
    </main>
  );
}
