import Image from "next/image";
import style from "./page.module.css";
import ProgramCard from "@/components/Program";
import connectDB from "@/database/db";
import ProgramModel from "@/database/models/programSchema";

export const dynamic = "force-dynamic";

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
  });
};

const getPrograms = async (): Promise<ProgramRecord[]> => {
  try {
    await connectDB();
    return await ProgramModel.find().sort({ date: 1 }).lean<ProgramRecord[]>();
  } catch (error) {
    console.error("Error fetching programs for home page:", error);
    return [];
  }
};

export default async function Home() {
  const programs = await getPrograms();

  return (
    <div className={style.pageContainer}>
      <header className={style.pageHeader}>
        <Image src="/operation-surf.png" alt="Operation Surf Logo" width={84} height={67} />

        <div className={style.headerButtons}>
          <button className={style.headerBtnOutline}>Sign In</button>
          <button className={style.headerBtnFilled}>Sign Up</button>
        </div>
      </header>

      <section className={style.hero}>
        <Image className={style.heroBg} src="/hero-img.png" alt="Operation Surf members by the ocean" fill />

        <div className={style.heroContent}>
          <h1 className={style.heroTitle}>Operation Surf</h1>
          <p className={style.heroSubtitle}>
            Empowering wounded, ill, and injured service members, veterans, and youth through the healing powers of the
            ocean.
          </p>
          <button className={style.exploreButton}>Explore Programs</button>
        </div>
      </section>

      <section className={style.about}>
        <h2 className={style.sectionTitle}>About Us</h2>
        <p className={style.sectionText}>
          Operation Surf is a non-profit organization dedicated to providing free surf therapy programs for wounded
          warriors, veterans, and at-risk youth. Through the healing power of the ocean, we help individuals overcome
          physical and mental challenges while building community and confidence.
        </p>

        <div className={style.aboutCards}>
          <div className={style.infoCard}>
            <div className={style.cardIcon} aria-hidden="true">
              Surf
            </div>
            <h3 className={style.cardTitle}>Surf Therapy</h3>
            <p className={style.cardText}>Therapeutic surfing sessions led by certified instructors</p>
          </div>

          <div className={style.infoCard}>
            <div className={style.cardIcon} aria-hidden="true">
              Community
            </div>
            <h3 className={style.cardTitle}>Community</h3>
            <p className={style.cardText}>Building lasting connections and support networks</p>
          </div>

          <div className={style.infoCard}>
            <div className={style.cardIcon} aria-hidden="true">
              Empower
            </div>
            <h3 className={style.cardTitle}>Empowerment</h3>
            <p className={style.cardText}>Helping individuals overcome challenges and thrive</p>
          </div>
        </div>
      </section>

      <div className={style.programs}>
        <h2 className={style.sectionTitle}>Our Programs</h2>

        <div className={style.programCards}>
          {programs.length > 0 ? (
            programs.map((program) => (
              <ProgramCard
                key={program.programId}
                image={program.imageURI}
                title={program.programName}
                location={program.location}
                date={formatProgramDate(program.date)}
                time={program.duration}
              />
            ))
          ) : (
            <div className={style.programCard}>No programs available right now.</div>
          )}
        </div>
      </div>

      <div className={style.pageFooter}>
        <h2 className={style.footerTitle}>Contact Us</h2>
        <p className={style.footerSubtitle}>Have questions or want to learn more about our programs?</p>

        <div className={style.footerColumns}>
          <div className={style.footerColumn}>
            <h3>Email</h3>
            <p>info@operationsurf.org</p>
          </div>

          <div className={style.footerColumn}>
            <h3>Phone</h3>
            <p>(555) 123-4567</p>
          </div>

          <div className={style.footerColumn}>
            <h3>Address</h3>
            <p>123 Ocean Ave, San Diego, CA 92109</p>
          </div>
        </div>
      </div>
    </div>
  );
}
