import { CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import connectDB from "@/database/db";
import ProgramModel from "@/database/models/programSchema";
import ProgramCardImage from "@/components/ProgramCardImage";
import styles from "@/styles/ProgramList.module.css";

type ProgramRecord = {
  imageURI: string;
  location: string;
  date: Date | string;
  duration: string;
  programName: string;
  programId: string;
};

const formatProgramDate = (value: Date | string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date TBD";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const getPrograms = async (): Promise<ProgramRecord[]> => {
  try {
    await connectDB();
    return await ProgramModel.find().sort({ date: 1 }).lean<ProgramRecord[]>();
  } catch (error) {
    console.error("Error fetching programs for program list:", error);
    return [];
  }
};

function ProgramCard({ program }: { program: ProgramRecord }) {
  return (
    <article className={styles.card}>
      <ProgramCardImage className={styles.cardImage} src={program.imageURI} alt={`${program.programName} program`} />

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={styles.date}>
            <CalendarDays size={14} aria-hidden="true" />
            {formatProgramDate(program.date)}
          </span>
        </div>

        <h2 className={styles.programName}>{program.programName}</h2>

        <dl className={styles.metaList}>
          <div className={styles.metaItem}>
            <dt>
              <MapPin size={16} aria-hidden="true" />
              <span className={styles.srOnly}>Location</span>
            </dt>
            <dd>{program.location}</dd>
          </div>

          <div className={styles.metaItem}>
            <dt>
              <Clock size={16} aria-hidden="true" />
              <span className={styles.srOnly}>Duration</span>
            </dt>
            <dd>{program.duration}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default async function ProgramList() {
  const programs = await getPrograms();

  return (
    <main className={styles.page}>
      <section className={styles.listShell} aria-labelledby="program-list-title">
        <div className={styles.listHeader}>
          <h1 id="program-list-title" className={styles.title}>
            Programs
          </h1>
          <Link className={styles.homeLink} href="/">
            Home
          </Link>
        </div>

        {programs.length === 0 ? (
          <p className={styles.emptyState}>No programs available right now.</p>
        ) : (
          <div className={styles.cardList}>
            {programs.map((program) => (
              <ProgramCard key={program.programId} program={program} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
