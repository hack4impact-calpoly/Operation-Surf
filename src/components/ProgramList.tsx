import Image from "next/image";
import { CalendarDays, Home, MapPin } from "lucide-react";
import Link from "next/link";
import connectDB from "@/database/db";
import ProgramModel from "@/database/models/programSchema";
import { getAuthContext } from "@/lib/authz";
import styles from "@/styles/ProgramList.module.css";

type ProgramRecord = {
  imageURI: string;
  location: string;
  date: Date | string;
  duration: string;
  programName: string;
  programId: string;
};

const formatProgramMonthYear = (value: Date | string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Dates TBD";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const formatProgramWeekday = (value: Date | string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
};

const formatProgramShortDate = (value: Date | string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date TBD";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
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
    <Link className={styles.card} href={`/program-details?programId=${encodeURIComponent(program.programId)}`}>
      <div className={styles.cardHeader}>
        <span className={styles.dayPill}>{formatProgramWeekday(program.date)}</span>
        <span className={styles.date}>{formatProgramShortDate(program.date)}</span>
      </div>

      <h2 className={styles.programName}>{program.programName}</h2>

      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>
          <CalendarDays size={16} aria-hidden="true" />
          {program.duration}
        </span>
        <span className={styles.metaItem}>
          <MapPin size={16} aria-hidden="true" />
          {program.location}
        </span>
      </div>
    </Link>
  );
}

export default async function ProgramList() {
  const programs = await getPrograms();
  const featuredProgram = programs[0];
  const { name } = await getAuthContext();

  return (
    <main className={styles.page}>
      <div className={styles.pageShell}>
        <nav className={styles.navbar} aria-label="Primary navigation">
          <Link className={styles.logoLink} href="/" aria-label="Operation Surf home">
            <Image src="/operation-surf.png" alt="Operation Surf" width={78} height={62} />
          </Link>

          <div className={styles.navLinks}>
            {name && <span className={styles.navGreeting}>Hi, {name}</span>}
            <Link href="/" className={styles.navLink}>
              <Home size={17} aria-hidden="true" />
              Home
            </Link>
            <Link href="/programs" className={styles.navLink}>
              <CalendarDays size={17} aria-hidden="true" />
              Programs
            </Link>
          </div>
        </nav>

        <header className={styles.hero}>
          <Image
            className={styles.heroImage}
            src="/hero-img.png"
            alt="Operation Surf participants by the ocean"
            fill
            priority
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Programs</h1>
            <div className={styles.heroMeta}>
              <span>
                <MapPin size={20} aria-hidden="true" />
                {featuredProgram?.location ?? "Santa Cruz, CA"}
              </span>
              <span>
                <CalendarDays size={20} aria-hidden="true" />
                {featuredProgram ? formatProgramMonthYear(featuredProgram.date) : "Upcoming programs"}
              </span>
            </div>
          </div>
        </header>

        <section className={styles.listShell} aria-labelledby="program-list-title">
          <h2 id="program-list-title" className={styles.sectionTitle}>
            Programs
          </h2>

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
      </div>
    </main>
  );
}
