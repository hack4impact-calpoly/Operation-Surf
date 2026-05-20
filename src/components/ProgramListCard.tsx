"use client";

import Link from "next/link";
import { CalendarDays, Loader2, MapPin } from "lucide-react";
import { useLinkLoading } from "@/hooks/useLinkLoading";
import styles from "@/styles/ProgramList.module.css";

type ProgramListCardProps = {
  href: string;
  programName: string;
  weekday: string;
  date: string;
  duration: string;
  location: string;
};

export default function ProgramListCard({
  href,
  programName,
  weekday,
  date,
  duration,
  location,
}: ProgramListCardProps) {
  const { isLoading, handleClick } = useLinkLoading(href);

  return (
    <Link
      className={`${styles.card} ${isLoading ? styles.cardLoading : ""}`}
      href={href}
      onClick={handleClick}
      aria-busy={isLoading}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardDateGroup}>
          <span className={styles.dayPill}>{weekday}</span>
          <span className={styles.date}>{date}</span>
        </span>

        <span
          className={`${styles.cardLoadingStatus} ${isLoading ? styles.cardLoadingStatusVisible : ""}`}
          aria-hidden={!isLoading}
        >
          <Loader2 size={15} aria-hidden="true" />
          Loading
        </span>
      </div>

      <h2 className={styles.programName}>{programName}</h2>

      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>
          <CalendarDays size={16} aria-hidden="true" />
          {duration}
        </span>
        <span className={styles.metaItem}>
          <MapPin size={16} aria-hidden="true" />
          {location}
        </span>
      </div>
    </Link>
  );
}
