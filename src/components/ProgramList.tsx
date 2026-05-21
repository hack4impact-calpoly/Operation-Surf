import Image from "next/image";
import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import connectDB from "@/database/db";
import ProgramModel from "@/database/models/programSchema";
import { getAuthContext } from "@/lib/authz";
import ProgramListCard from "@/components/ProgramListCard";
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
    <ProgramListCard
      href={`/program-details?programId=${encodeURIComponent(program.programId)}`}
      imageURI={program.imageURI}
      programName={program.programName}
      date={formatProgramMonthYear(program.date)}
      location={program.location}
    />
  );
}

export default async function ProgramList() {
  const programs = await getPrograms();
  const { isAdmin } = await getAuthContext();

  return (
    <main className={styles.page}>
      <div className={styles.pageShell}>
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
          </div>
        </header>

        <section className={styles.listShell} aria-labelledby="program-list-title">
          <div className={styles.sectionHeader}>
            <h2 id="program-list-title" className={styles.sectionTitle}>
              Programs
            </h2>

            {isAdmin ? (
              <Link href="/opportunities" className={styles.adminAction}>
                <BriefcaseBusiness size={16} aria-hidden="true" />
                Opportunities
              </Link>
            ) : null}
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
      </div>
    </main>
  );
}
