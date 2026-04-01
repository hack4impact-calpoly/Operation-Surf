"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/ProgramDetail.module.css";

interface Program {
  programName: string;
  location: string;
  date: string;
  imageURI: string;
  programId: string;
  duration: string;
}

interface Day {
  dayId: string;
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  eventId: string;
  programId: string;
}

interface ProgramDetailProps {
  programId: string;
  program: Program;
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function DayCard({ day }: { day: Day }) {
  return (
    <div className={styles.dayCard}>
      <div className={styles.dayCardHeader}>
        <span className={styles.dayOfWeek}>{day.dayOfWeek}</span>
        <span className={styles.date}>{formatDate(day.date)}</span>
      </div>
      <p className={styles.dayName}>{day.name}</p>
      <div className={styles.timeRow}>
        <span>🗓</span>
        <span className={styles.time}>{day.startTime} - {day.endTime}</span>
      </div>
    </div>
  );
}

export default function ProgramDetail({ programId, program }: ProgramDetailProps) {
  const [days, setDays] = useState<Day[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDays() {
      try {
        const res = await fetch(`/api/program/${programId}/days`);
        if (!res.ok) throw new Error("Failed to load days");
        const data = await res.json();
        setDays(data.days);
      } catch (err) {
        setError("Could not load days. Please try again.");
        console.error(err);
      } finally {
        setLoadingDays(false);
      }
    }
    fetchDays();
  }, [programId]);

  return (
    <div className={styles.page}>

      {/* hero */}
      <header className={styles.hero}>
        <img
          src={program.imageURI}
          alt={`${program.programName} background`}
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.programName}>{program.programName}</h1>
          <div className={styles.heroMeta}>
            <span>📍 {program.location}</span>
            <span>🗓 {formatMonthYear(program.date)}</span>
          </div>
        </div>
      </header>

      {/* the shift list */}
      <section className={styles.shiftSection} aria-label="Program schedule">
        <h2 className={styles.shiftTitle}>Shift</h2>

        {loadingDays && <p className={styles.statusMsg}>Loading...</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}
        {!loadingDays && !error && days.length === 0 && (
          <p className={styles.statusMsg}>No days available</p>
        )}
        {!loadingDays && !error && days.map((day) => (
          <DayCard key={day.dayId} day={day} />
        ))}
      </section>

    </div>
  );
}