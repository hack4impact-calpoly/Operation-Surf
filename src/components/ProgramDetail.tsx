"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useLinkLoading } from "@/hooks/useLinkLoading";
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

function formatDateBadge(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return { weekday: "TBD", day: "--", month: "TBD" };
  }

  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase(),
    day: d.toLocaleDateString("en-US", { day: "2-digit", timeZone: "UTC" }),
    month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
  };
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

function DayCard({ day, program }: { day: Day; program: Program }) {
  const href = `/day-details/${encodeURIComponent(day.dayId)}`;
  const { isLoading, handleClick } = useLinkLoading(href);
  const badge = formatDateBadge(day.date);
  const heroImageSrc = normalizeImageSrc(program.imageURI);

  return (
    <Link
      href={href}
      className={`${styles.dayCard} ${isLoading ? styles.dayCardLoading : ""}`}
      onClick={handleClick}
      aria-busy={isLoading}
      aria-label={`View details for ${day.name}`}
    >
      <div className={styles.dayCardImageWrap}>
        <Image
          src={heroImageSrc}
          alt={program.programName}
          className={styles.dayCardImage}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          unoptimized
        />
        <div className={styles.dayDateBadge} aria-label={formatDate(day.date)}>
          <span>{badge.weekday}</span>
          <strong>{badge.day}</strong>
          <span>{badge.month}</span>
        </div>
        <span
          className={`${styles.dayCardLoadingStatus} ${isLoading ? styles.dayCardLoadingStatusVisible : ""}`}
          aria-hidden={!isLoading}
        >
          <Loader2 size={15} aria-hidden="true" />
          Loading
        </span>
        <span className={styles.dayLabel}>{day.name}</span>
      </div>

      <div className={styles.dayCardBody}>
        <div className={styles.locationRow}>
          <MapPin size={14} aria-hidden="true" />
          <span>{program.location}</span>
        </div>
        <p className={styles.dayName}>{program.programName}</p>
        <div className={styles.dayCardFooter}>
          <div className={styles.timeRow}>
            <CalendarIcon />
            <span className={styles.time}>
              {day.startTime} - {day.endTime}
            </span>
          </div>
          <span className={styles.dayPill}>View Day</span>
        </div>
      </div>
    </Link>
  );
}

export default function ProgramDetail({ programId, program }: ProgramDetailProps) {
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
      {/* hero */}
      <header className={styles.hero}>
        <Image
          src={heroImageSrc}
          alt={`${program.programName} background`}
          className={styles.heroBg}
          fill
          priority
          sizes="100vw"
          unoptimized
        />
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
        <h2 className={styles.shiftTitle}>Days</h2>

        {loadingDays && <p className={styles.statusMsg}>Loading...</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}
        {!loadingDays && !error && days.length === 0 && <p className={styles.statusMsg}>No days available</p>}
        {!loadingDays && !error ? (
          <div className={styles.daysGrid}>
            {days.map((day) => (
              <DayCard key={day.dayId} day={day} program={program} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
