"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import GreyNavbar from "@/components/GreyNavbar";

import styles from "@/styles/Confirmation.module.css";

type Day = {
  name: string;
  date: string;
  location?: string;
};

type Shift = {
  shiftId: string;
  name: string;
  startTime: string;
  endTime: string;
  location: string;
};

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dayId = searchParams.get("dayId");
  const shiftIds = searchParams.get("shiftIds")?.split(",") ?? [];

  const [day, setDay] = useState<Day | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!dayId) return;

      const [dayRes, shiftRes] = await Promise.all([fetch(`/api/day/${dayId}`), fetch("/api/shift")]);

      const dayJson = await dayRes.json();
      const shiftJson = await shiftRes.json();

      setDay(dayJson.day);

      const selectedShifts = shiftJson.data.filter((shift: Shift) => shiftIds.includes(shift.shiftId));

      setShifts(selectedShifts);
    }

    loadData();
  }, [dayId, shiftIds]);

  return (
    <main className={styles.page}>
      <GreyNavbar />

      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Thank You For Signing Up!</h1>

          <p className={styles.subtitle}>Your volunteer shift registration has been confirmed.</p>

          {day && (
            <section className={styles.section}>
              <h2>Event Details</h2>

              <p>
                <strong>{day.name}</strong>
              </p>

              <p>{new Date(day.date).toLocaleDateString()}</p>

              <p>{day.location}</p>
            </section>
          )}

          <section className={styles.section}>
            <h2>Your Shifts</h2>

            {shifts.map((shift) => (
              <div className={styles.shiftCard} key={shift.shiftId}>
                <h3>{shift.name}</h3>

                <p>
                  {shift.startTime} - {shift.endTime}
                </p>

                <p>{shift.location}</p>
              </div>
            ))}
          </section>

          <div className={styles.buttonRow}>
            <button className={styles.primaryBtn} onClick={() => router.push("/dashboard")}>
              Confirm
            </button>

            <button className={styles.secondaryBtn} onClick={() => router.back()}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
