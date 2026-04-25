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
  viewerName?: string | null;
}

function normalizeImageSrc(imageURI: string): string {
  if (imageURI.startsWith("http") || imageURI.startsWith("/")) {
    return imageURI;
  }

  return `/${imageURI}`;
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return "Date TBD";
  }

  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return "Date TBD";
  }

  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.calendarIcon}
    >
      <rect x="1" y="2" width="14" height="13" rx="2" stroke="#9ca3af" strokeWidth="1.5" />
      <path d="M1 6h14" stroke="rgba(124, 120, 69, 1)" strokeWidth="1.5" />
      <path d="M5 1v2M11 1v2" stroke="rgba(124, 120, 69, 1)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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
        <CalendarIcon />
        <span className={styles.time}>
          {day.startTime} - {day.endTime}
        </span>
      </div>
    </div>
  );
}

export default function ProgramDetail({ programId, program, viewerName }: ProgramDetailProps) {
  const [days, setDays] = useState<Day[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroImageSrc = normalizeImageSrc(program.imageURI);

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
      {/* navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <img src="/operation-surf.png" alt="Operation Surf" className={styles.logoImg} />
        </div>
        <div className={styles.navLinks}>
          {viewerName && <span className={styles.navGreeting}>Hi, {viewerName}</span>}
          <a href="/" className={styles.navLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M6 15V9h4v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            Home
          </a>
          <a href="/programs" className={styles.navLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Programs
          </a>
        </div>
      </nav>

      {/* hero */}
      <header className={styles.hero}>
        <img src={heroImageSrc} alt={`${program.programName} background`} className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.programName}>{program.programName}</h1>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaText}>📍 {program.location}</span>
            <span className={styles.heroMetaText}>🗓 {formatMonthYear(program.date)}</span>
          </div>
        </div>
      </header>

      {/* the shift list */}
      <section className={styles.shiftSection} aria-label="Program schedule">
        <h2 className={styles.shiftTitle}>Shift</h2>

        {loadingDays && <p className={styles.statusMsg}>Loading...</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}
        {!loadingDays && !error && days.length === 0 && <p className={styles.statusMsg}>No days available</p>}
        {!loadingDays && !error && days.map((day) => <DayCard key={day.dayId} day={day} />)}
      </section>
    </div>
  );
}
