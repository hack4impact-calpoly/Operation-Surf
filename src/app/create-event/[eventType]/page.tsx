import Image from "next/image";
import { Suspense } from "react";
import CreateProgram from "@/components/event-creation/CreateProgram";
// import CreateDay from "@/components/event-creation/CreateDay";
// import CreateShift from "@/components/event-creation/CreateShift";

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
    return <div>create day coming soon</div>;
  }

  if (eventType === "shift") {
    return <div>create shift coming soon</div>;
  }

  return <div>invalid event type</div>;
}
