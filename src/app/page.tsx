import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import Program from "@/components/Program";

export default function Home() {
  return (
    <main>
      <Navbar />
      <h1>Home</h1>

      {/* placehodler for testing
        <Program
          image="/waves.png"
          title="Operation Surf"
          location="Santa Cruz, CA"
          date="July 15, 2024"
          time="10:00 AM - 2:00 PM"
        />
      */}

      {/* placeholder for testing
      <EventCard
        place="Place"
        name="Event Name"
        host="Operation Surf"
        availability={0}
        MaxAvailability={3}
        date={new Date("2024-07-15")}
        image="/operation-surf.png"
        hostIcon="/operation-surf.png"
      /> */}
    </main>
  );
}
