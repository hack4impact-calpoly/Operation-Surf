import styles from "@/styles/ShiftCard.module.css";

export type ShiftCardProps = {
  id?: string;
  name: string;
  description?: string;
  dateRange: string;
  timeRange: string;
  timezone?: string;
  location?: string;
  spotsTaken: number;
  spotsTotal: number;
};

export default function ShiftCard({
  name,
  description,
  dateRange,
  timeRange,
  timezone,
  location,
  spotsTaken,
  spotsTotal,
}: ShiftCardProps) {
  return (
    <article className={styles.card} aria-label={`${name} shift`}>
      <header className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
      </header>

      {description ? <p className={styles.description}>{description}</p> : null}

      <ul className={styles.metaList}>
        <li className={styles.metaItem}>
          {/* <span className={styles.metaIcon} aria-hidden="true">
            📅
          </span> */}
          <span>{dateRange}</span>
        </li>
        <li className={styles.metaItem}>
          {/* <span className={styles.metaIcon} aria-hidden="true">
            ⏱️
          </span> */}
          <span>
            {timeRange} {timezone ? `(${timezone})` : ""}
          </span>
        </li>
        {location ? (
          <li className={styles.metaItem}>
            {/* <span className={styles.metaIcon} aria-hidden="true">
              📍
            </span>
            <span>{location}</span> */}
          </li>
        ) : null}
      </ul>

      <span className={styles.badge}>
        {spotsTaken}/{spotsTotal} Spots Taken
      </span>
    </article>
  );
}
