"use client";

import Link from "next/link";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import ProgramCardImage from "@/components/ProgramCardImage";
import { useLinkLoading } from "@/hooks/useLinkLoading";
import styles from "@/styles/ProgramList.module.css";

type ProgramListCardProps = {
  href: string;
  imageURI?: string | null;
  programName: string;
  date: string;
  location: string;
};

export default function ProgramListCard({ href, imageURI, programName, date, location }: ProgramListCardProps) {
  const { isLoading, handleClick } = useLinkLoading(href);

  return (
    <Link
      className={`${styles.card} ${isLoading ? styles.cardLoading : ""}`}
      href={href}
      onClick={handleClick}
      aria-busy={isLoading}
    >
      <div className={styles.cardMedia}>
        <ProgramCardImage className={styles.cardImage} src={imageURI} alt={`${programName} program`} />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTopRow}>
          <span className={styles.locationRow}>
            <MapPin size={18} aria-hidden="true" />
            {location}
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

        <div className={styles.cardFooter}>
          <span className={styles.datePill}>{date}</span>

          <span className={styles.viewDaysButton}>
            View Days
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
