"use client";

import { useEffect, useState } from "react";
import ShiftCardList from "@/components/shift-card/ShiftCardList";
import type { ShiftCardProps } from "@/components/shift-card/ShiftCard";

type ShiftApiResponse = {
  data: Array<{
    shiftId: string;
    name: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    mapLink?: string;
    totalSlots: number;
  }>;
};

function formatShiftDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Shift() {
  const [shifts, setShifts] = useState<ShiftCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShifts() {
      try {
        const response = await fetch("/api/shift");
        if (!response.ok) {
          throw new Error(`Failed to load shifts: ${response.status}`);
        }

        const json = (await response.json()) as ShiftApiResponse;

        const cardData: ShiftCardProps[] = json.data.map((shift) => ({
          id: shift.shiftId,
          name: shift.name,
          description: shift.description ?? "",
          dateRange: formatShiftDate(shift.date),
          timeRange: `${shift.startTime} - ${shift.endTime}`,
          location: shift.location,
          mapLink: shift.mapLink,
          spotsTaken: 0,
          spotsTotal: shift.totalSlots ?? 0,
        }));

        setShifts(cardData);
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else {
          setError("An unexpected error occurred while loading shifts.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchShifts();
  }, []);

  return (
    <main>
      <h1>Available Shifts</h1>
      {isLoading ? (
        <p>Loading shifts…</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : shifts.length === 0 ? (
        <p>No shifts available.</p>
      ) : (
        <ShiftCardList shifts={shifts} />
      )}
    </main>
  );
}

export default Shift;
