import Image from "next/image";
import { Suspense } from "react";
import CreateProgram from "@/components/event-creation/CreateProgram";
import CreateDay from "@/components/event-creation/CreateDay";
import CreateShift from "@/components/event-creation/CreateShift";

type Props = {
  params: {
    eventType: string;
  };
};

export default function CreateEventPage({ params }: Props) {
  const { eventType } = params;

  if (eventType === "program") {
    return <CreateProgram />;
  }

  if (eventType === "day") {
    return <CreateDay />;
  }

  if (eventType === "shift") {
    return <CreateShift />;
  }

  return <div>invalid event type</div>;
}
