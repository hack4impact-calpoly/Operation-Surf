import styles from "@/styles/EventsBreakdown.module.css";
import ShiftCardList from "./shift-card/ShiftCardList";
import { ShiftCardProps } from "./shift-card/ShiftCard";

export interface Shift {
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  location: string;
  shiftId: string;
  eventId: string;
}

interface EventsBreakdownProps {
  eventId: string;
  shifts: Shift[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function toShiftCardProps(shift: Shift): ShiftCardProps {
  return {
    id: shift.shiftId,
    name: shift.name,
    dateRange: `${shift.dayOfWeek}, ${formatDate(shift.date)}`,
    timeRange: `${shift.startTime} - ${shift.endTime}`,
    location: shift.location,
    spotsTaken: 0,
    spotsTotal: shift.totalSlots,
  };
}

export default function EventsBreakdown({ eventId, shifts }: EventsBreakdownProps) {
  const eventShifts = shifts.filter((s) => s.eventId === eventId);

  return (
    <section className={styles.container} aria-label="Events Breakdown">
      <h2 className={styles.title}>Events Breakdown</h2>

      {eventShifts.length === 0 ? (
        <p className={styles.emptyMsg}>No shifts available for this event.</p>
      ) : (
        <ShiftCardList shifts={eventShifts.map(toShiftCardProps)} />
      )}
    </section>
  );
}
