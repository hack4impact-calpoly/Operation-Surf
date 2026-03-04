import ProgramCard from "@/components/Program";
import connectDB from "@/database/db";
import ProgramModel from "@/database/models/programSchema";
import style from "@/styles/ProgramHorizontalList.module.css";

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
    console.error("Error fetching programs for horizontal list:", error);
    return [];
  }
};

const ProgramHorizontalList = async () => {
  const programs = await getPrograms();

  if (programs.length === 0) {
    return <div className={style.emptyState}>No programs available right now.</div>;
  }

  return (
    <div className={style.scrollFrame} aria-label="Programs">
      {programs.map((program) => (
        <div className={style.cardSlot} key={program.programId}>
          <ProgramCard
            image={program.imageURI}
            title={program.programName}
            location={program.location}
            date={formatProgramDate(program.date)}
            time={program.duration}
          />
        </div>
      ))}
    </div>
  );
};

export default ProgramHorizontalList;
