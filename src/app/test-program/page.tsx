import ProgramDetail from "@/components/ProgramDetail";

export default function TestPage() {
  const mockProgram = {
    programName: "Operation Surf SLO",
    location: "San Luis Obispo, CA",
    date: "2026-04-10",
    imageURI: "waves.png",
    programId: "100",
    duration: "3 days",
  };

  return <ProgramDetail programId="100" program={mockProgram} />;
}
