// app/events/[dayId]/page.tsx
import ShiftCardList from "@/components/shift-card/ShiftCardList";

async function getShifts() {
  // TEMP: fetch all shifts for now
  const res = await fetch(
    "http://localhost:3000/api/shift", // http://localhost:3000/api/day/${dayId}/shifts in the future
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch shifts");
  }

  return res.json();
}

export default async function EventDetailsPage() {
  // temp
  const dayId = "day-test-001";

  const data = await getShifts();

  // filter shifts by dayId
  const shifts = data.data.filter((shift: any) => shift.dayId === dayId);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Event Details</h1>

        <p className="text-gray-500">Day ID: {dayId}</p>
      </div>

      {/* Banner Placeholder */}
      <div className="h-[250px] w-full overflow-hidden rounded-2xl bg-gray-200">
        <div className="flex h-full items-center justify-center text-gray-500">Event Banner Placeholder</div>
      </div>

      {/* Event Info */}
      <div className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Event Information</h2>

        <div className="flex flex-col gap-3">
          <p>
            <strong>Date:</strong> TBD
          </p>

          <p>
            <strong>Location:</strong> TBD
          </p>

          <p>
            <strong>Description:</strong> TBD
          </p>
        </div>
      </div>

      {/* Shifts */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Available Shifts</h2>

        <ShiftCardList shifts={shifts} />
      </div>

      {/* Contact Card */}
      <div className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>

        <div className="flex flex-col gap-2">
          <p>Jane Doe</p>
          <p>jane@email.com</p>
          <p>(555) 555-5555</p>
        </div>
      </div>
    </div>
  );
}
