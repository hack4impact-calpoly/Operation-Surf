import type { Metadata } from "next";
import ProgramList from "@/components/ProgramList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programs | Operation Surf",
  description: "View available Operation Surf programs.",
};

export default function ProgramsPage() {
  return <ProgramList />;
}
