import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";

export default function Home() {
  return (
    <main>
      <Navbar />
      <h1>Home</h1>

      {/* placeholder for testing */}
      <EventCard
        place="Place"
        name="Event Name"
        host="Operation Surf"
        availability="0/3"
        date={new Date("2024-07-15")}
        image="/docs/images/vs-code-settings.png"
      />
    </main>
  );
}
