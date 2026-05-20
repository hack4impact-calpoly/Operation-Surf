import { CalendarDays, ClipboardCheck, Clock, MapPin, UsersRound } from "lucide-react";
import Link from "next/link";
import styles from "@/styles/ShiftCard.module.css";

export function toGoogleMapsEmbed(url: string | undefined): string {
  if (!url) return "";
  try {
    const decoded = decodeURIComponent(url);

    const placeMatch = decoded.match(/\/place\/([^\/@]+)/);
    if (placeMatch) {
      const place = placeMatch[1].replace(/\+/g, " ").trim().replace(/\s+/g, "+");

      return `https://www.google.com/maps?q=${place}&output=embed`;
    }

    const coordMatch = decoded.match(/!3d([-0-9.]+)!4d([-0-9.]+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
    }

    const atMatch = decoded.match(/@([-0-9.]+),([-0-9.]+)/);
    if (atMatch) {
      const lat = atMatch[1];
      const lng = atMatch[2];
      return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
    }

    return "";
  } catch {
    return "";
  }
}

export type ShiftCardProps = {
  id?: string;
  name: string;
  description?: string;
  dateRange: string;
  timeRange: string;
  timezone?: string;
  location?: string;
  mapLink?: string;
  spotsTaken: number;
  spotsTotal: number;
};

export default function ShiftCard({
  id,
  name,
  description,
  dateRange,
  timeRange,
  timezone,
  location,
  mapLink,
  spotsTaken,
  spotsTotal,
}: ShiftCardProps) {
  const embeddedMapLink = toGoogleMapsEmbed(mapLink);

  return (
    <article className={styles.card} aria-label={`${name} shift`}>
      <div className={styles.cardBody}>
        <header className={styles.header}>
          <h3 className={styles.title}>{name}</h3>
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>

        <ul className={styles.metaList}>
          <li className={styles.metaItem}>
            <CalendarDays size={18} aria-hidden="true" />
            <span>{dateRange}</span>
          </li>
          <li className={styles.metaItem}>
            <Clock size={18} aria-hidden="true" />
            <span>
              {timeRange} {timezone ? `(${timezone})` : ""}
            </span>
          </li>
          {location ? (
            <li className={styles.metaItem}>
              <MapPin size={18} aria-hidden="true" />
              <span>{location}</span>
            </li>
          ) : null}
        </ul>
      </div>

      {embeddedMapLink ? (
        <div className={styles.mapPanel}>
          <iframe src={embeddedMapLink} title={`${name} map`} loading="lazy" className={styles.iframeMap} />
        </div>
      ) : null}

      <footer className={styles.footer}>
        <span className={styles.badge}>
          <UsersRound size={16} aria-hidden="true" />
          <span>
            {spotsTaken}/{spotsTotal} Spots Taken
          </span>
        </span>

        {id ? (
          <Link className={styles.checkInLink} href={`/checkin/${encodeURIComponent(id)}`}>
            <ClipboardCheck size={16} aria-hidden="true" />
            <span>Check In</span>
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
