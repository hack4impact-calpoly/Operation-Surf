"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Roboto_Slab } from "next/font/google";
import { CalendarDays, ChevronRight, MapPin, Pencil, Plus } from "lucide-react";
import styles from "./OpportunitiesDashboard.module.css";

type ProgramRecord = {
  programId: string;
  programName: string;
  location: string;
  imageURI: string;
  date: string;
  duration: string;
};

type DayRecord = {
  dayId: string;
  programId: string;
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
};

type ShiftRecord = {
  shiftId: string;
  dayId: string;
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  totalSlots: number;
  visibility: "public" | "invited";
  description: string;
};

type OpportunitiesDashboardProps = {
  programs: ProgramRecord[];
  days: DayRecord[];
  shifts: ShiftRecord[];
};

type TabKey = "programs" | "days" | "shifts";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
});

const addRouteByTab: Record<TabKey, string> = {
  programs: "/create-event/program",
  days: "/create-event/day",
  shifts: "/create-event/shift",
};

const addLabelByTab: Record<TabKey, string> = {
  programs: "Add Program",
  days: "Add Day",
  shifts: "Add Shift",
};

function normalizeImageSrc(imageURI: string): string {
  if (!imageURI) return "/hero-img.png";
  if (imageURI.startsWith("http") || imageURI.startsWith("/")) return imageURI;
  return `/${imageURI}`;
}

function formatMonthYear(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Date TBD";

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatLongDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Date TBD";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function OpportunitiesDashboard({ programs, days, shifts }: OpportunitiesDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("programs");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const programById = useMemo(() => new Map(programs.map((program) => [program.programId, program])), [programs]);
  const dayById = useMemo(() => new Map(days.map((day) => [day.dayId, day])), [days]);

  const filteredDays = useMemo(() => {
    if (!selectedProgramId) return days;
    return days.filter((day) => day.programId === selectedProgramId);
  }, [days, selectedProgramId]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      if (selectedDayId) return shift.dayId === selectedDayId;
      if (selectedProgramId) {
        const day = dayById.get(shift.dayId);
        return day?.programId === selectedProgramId;
      }
      return true;
    });
  }, [dayById, selectedDayId, selectedProgramId, shifts]);

  const selectedProgram = selectedProgramId ? programById.get(selectedProgramId) : null;
  const selectedDay = selectedDayId ? dayById.get(selectedDayId) : null;

  const handleSelectPrograms = () => {
    setActiveTab("programs");
    setSelectedProgramId(null);
    setSelectedDayId(null);
  };

  const handleSelectDays = (programId?: string) => {
    setActiveTab("days");
    setSelectedProgramId(programId ?? null);
    setSelectedDayId(null);
  };

  const handleSelectShifts = (dayId?: string, programId?: string) => {
    setActiveTab("shifts");
    setSelectedProgramId(programId ?? null);
    setSelectedDayId(dayId ?? null);
  };

  return (
    <main className={`${styles.page} ${robotoSlab.className}`}>
      <header className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Manage Opportunities</h1>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.tabList} role="tablist" aria-label="Opportunities views">
            <button
              type="button"
              className={activeTab === "programs" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={handleSelectPrograms}
            >
              Programs
            </button>
            <button
              type="button"
              className={activeTab === "days" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => handleSelectDays(selectedProgramId ?? undefined)}
            >
              Days
            </button>
            <button
              type="button"
              className={activeTab === "shifts" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => handleSelectShifts(selectedDayId ?? undefined, selectedProgramId ?? undefined)}
            >
              Shifts
            </button>
          </div>

          <Link className={styles.primaryAction} href={addRouteByTab[activeTab]}>
            <Plus size={16} aria-hidden="true" />
            {addLabelByTab[activeTab]}
          </Link>
        </div>

        {(selectedProgram || selectedDay) && (
          <div className={styles.filterBar}>
            {selectedProgram ? (
              <button type="button" className={styles.filterChip} onClick={() => handleSelectDays()}>
                {selectedProgram.programName}
              </button>
            ) : null}
            {selectedDay ? (
              <button
                type="button"
                className={styles.filterChip}
                onClick={() => handleSelectShifts(undefined, selectedProgramId ?? undefined)}
              >
                {selectedDay.name}
              </button>
            ) : null}
            <button type="button" className={styles.clearFilters} onClick={handleSelectPrograms}>
              Clear filters
            </button>
          </div>
        )}

        <div className={styles.list}>
          {activeTab === "programs" &&
            programs.map((program) => (
              <article key={program.programId} className={styles.card}>
                <img className={styles.cardImage} src={normalizeImageSrc(program.imageURI)} alt={program.programName} />
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.locationRow}>
                      <MapPin size={14} aria-hidden="true" />
                      {program.location}
                    </span>
                  </div>
                  <h2 className={styles.cardTitle}>{program.programName}</h2>
                  <div className={styles.cardFooter}>
                    <span className={styles.datePill}>{formatMonthYear(program.date)}</span>
                    <button
                      type="button"
                      className={styles.secondaryAction}
                      onClick={() => handleSelectDays(program.programId)}
                    >
                      View Days
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <Link
                  href={`/create-event/program?programId=${encodeURIComponent(program.programId)}`}
                  className={styles.iconAction}
                  aria-label={`Edit ${program.programName}`}
                >
                  <Pencil size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}

          {activeTab === "days" &&
            filteredDays.map((day) => {
              const program = programById.get(day.programId);

              return (
                <article key={day.dayId} className={styles.card}>
                  <img
                    className={styles.cardImage}
                    src={normalizeImageSrc(program?.imageURI ?? "/hero-img.png")}
                    alt={program?.programName ?? day.name}
                  />
                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span className={styles.locationRow}>
                        <CalendarDays size={14} aria-hidden="true" />
                        {program?.programName ?? "Program unavailable"}
                      </span>
                    </div>
                    <h2 className={styles.cardTitle}>{day.name}</h2>
                    <p className={styles.detailText}>
                      {formatLongDate(day.date)} | {day.startTime} - {day.endTime}
                    </p>
                    <div className={styles.cardFooter}>
                      <span className={styles.datePill}>{day.dayOfWeek}</span>
                      <button
                        type="button"
                        className={styles.secondaryAction}
                        onClick={() => handleSelectShifts(day.dayId, day.programId)}
                      >
                        View Shifts
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/create-event/day?dayId=${encodeURIComponent(day.dayId)}`}
                    className={styles.iconAction}
                    aria-label={`Edit ${day.name}`}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}

          {activeTab === "shifts" &&
            filteredShifts.map((shift) => {
              const day = dayById.get(shift.dayId);
              const program = day ? programById.get(day.programId) : null;

              return (
                <article key={shift.shiftId} className={styles.card}>
                  <img
                    className={styles.cardImage}
                    src={normalizeImageSrc(program?.imageURI ?? "/hero-img.png")}
                    alt={shift.name}
                  />
                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span className={styles.locationRow}>
                        <MapPin size={14} aria-hidden="true" />
                        {shift.location}
                      </span>
                    </div>
                    <h2 className={styles.cardTitle}>{shift.name}</h2>
                    <p className={styles.detailText}>
                      {program?.programName ?? "Program unavailable"} | {day?.name ?? "Day unavailable"}
                    </p>
                    <p className={styles.detailText}>
                      {formatLongDate(shift.date)} | {shift.startTime} - {shift.endTime}
                    </p>
                    <div className={styles.cardFooter}>
                      <span className={styles.datePill}>
                        {shift.visibility === "invited" ? "Invited" : "Public"} | {shift.totalSlots} slots
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/create-event/shift?shiftId=${encodeURIComponent(shift.shiftId)}`}
                    className={styles.iconAction}
                    aria-label={`Edit ${shift.name}`}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}

          {activeTab === "programs" && programs.length === 0 ? (
            <p className={styles.emptyState}>No programs available yet.</p>
          ) : null}
          {activeTab === "days" && filteredDays.length === 0 ? (
            <p className={styles.emptyState}>No days match this selection yet.</p>
          ) : null}
          {activeTab === "shifts" && filteredShifts.length === 0 ? (
            <p className={styles.emptyState}>No shifts match this selection yet.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
