import ProgramDetail from "@/components/ProgramDetail";
import connectDB from "@/database/db";
import ProgramModel from "@/database/models/programSchema";
import { getAuthContext } from "@/lib/authz";
import { notFound } from "next/navigation";

type ProgramRecord = {
  imageURI: string;
  location: string;
  date: Date | string;
  duration: string;
  programName: string;
  programId: string;
};

type ProgramDetailsPageProps = {
  searchParams?: {
    programId?: string | string[];
  };
};

const getProgramId = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const serializeProgram = (program: ProgramRecord) => ({
  programName: program.programName,
  location: program.location,
  date: program.date instanceof Date ? program.date.toISOString() : program.date,
  imageURI: program.imageURI,
  programId: program.programId,
  duration: program.duration,
});

async function getProgram(programId: string) {
  await connectDB();
  const program = await ProgramModel.findOne({ programId }).lean<ProgramRecord | null>();

  if (!program) {
    return null;
  }

  return serializeProgram(program);
}

export default async function ProgramDetailsPage({ searchParams }: ProgramDetailsPageProps) {
  const programId = getProgramId(searchParams?.programId);

  if (!programId) {
    notFound();
  }

  const program = await getProgram(programId);
  const { name, isAdmin } = await getAuthContext();

  if (!program) {
    notFound();
  }

  return <ProgramDetail programId={program.programId} program={program} viewerName={name} isAdmin={isAdmin} />;
}
