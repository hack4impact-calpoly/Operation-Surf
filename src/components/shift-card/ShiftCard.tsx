import styles from "@/styles/ShiftCard.module.css";

export function toGoogleMapsEmbed(url: string | undefined): string {
  if (!url) return "";
  try {
    const decoded = decodeURIComponent(url);

    // 1. Try to extract place name from `/place/...`
    const placeMatch = decoded.match(/\/place\/([^\/@]+)/);
    if (placeMatch) {
      const place = placeMatch[1].replace(/\+/g, " ").trim().replace(/\s+/g, "+");

      return `https://www.google.com/maps?q=${place}&output=embed`;
    }

    // 2. Fallback: extract coordinates (!3dLAT!4dLNG)
    const coordMatch = decoded.match(/!3d([-0-9.]+)!4d([-0-9.]+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
    }

    // 3. Fallback: look for @lat,lng
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
  if (mapLink) mapLink = toGoogleMapsEmbed(mapLink);
  return (
    <article className={styles.card} aria-label={`${name} shift`}>
      <header className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
      </header>

      {description ? <p className={styles.description}>{description}</p> : null}

      <ul className={styles.metaList}>
        <li className={styles.metaItem}>
          <span>{dateRange}</span>
        </li>
        <li className={styles.metaItem}>
          <span>
            {timeRange} {timezone ? `(${timezone})` : ""}
          </span>
        </li>
        {location || mapLink ? (
          <li className={styles.metaItem}>
            {location ? <span>{location}</span> : null}
            {mapLink ? (
              <div style={{ marginTop: "0.75rem", minHeight: "200px" }}>
                <span>{mapLink}</span>
                <iframe
                  src={mapLink}
                  title={`${name} map`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    border: "1px solid #ddd",
                    borderRadius: "0.5rem",
                  }}
                />
              </div>
            ) : null}
          </li>
        ) : null}
      </ul>

      <span className={styles.badge}>
        {spotsTaken}/{spotsTotal} Spots Taken
      </span>
    </article>
  );
}
