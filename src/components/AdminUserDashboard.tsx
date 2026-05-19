"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Pencil } from "lucide-react";
import styles from "@/styles/AdminUserDashboard.module.css";

type Profile = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  emergencyContact: string;
  notes: string;
  hours: number;
  monthJoined: string;
};

type RegisteredEvent = {
  signupId: string;
  shiftId: string;
  name: string;
  date: string | null;
  status: string;
};

type AdminUserDashboardProps = {
  profile: Profile;
  registeredEvents: RegisteredEvent[];
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const dateOnly = dateStr.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUserDashboard({ profile, registeredEvents }: AdminUserDashboardProps) {
  const [notes, setNotes] = useState(profile.notes ?? "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const firstName = profile.fullName.split(" ")[0];

  async function handleSaveNotes() {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/volunteer/${profile.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to save notes");
      }
      setSaveSuccess(true);
      setIsEditingNotes(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelEdit() {
    setNotes(profile.notes ?? "");
    setIsEditingNotes(false);
    setSaveError(null);
  }

  return (
    <div className={styles.page}>
      {/* HERO */}
      <header className={styles.hero}>
        <img src="/hero-img.png" alt="Dashboard background" className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{firstName}&apos;s Dashboard</h1>
          <p className={styles.heroSubtitle}>Manage your profile, events, and shifts</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        {/* LEFT SIDE (PROFILE CARD) */}
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.profileCardHeader}>
              <h2 className={styles.profileCardTitle}>{firstName}&apos;s Information</h2>
              <button className={styles.editIconBtn} aria-label="Edit profile">
                <Pencil size={15} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.avatarCircle}>{getInitials(profile.fullName)}</div>

            <div className={styles.profileFields}>
              <p className={styles.fieldLabel}>Full Name</p>
              <p className={styles.fieldValue}>
                <User size={14} strokeWidth={1.8} className={styles.fieldIcon} />
                {profile.fullName}
              </p>
              <p className={styles.fieldLabel}>Email</p>
              <p className={styles.fieldValue}>
                <Mail size={14} strokeWidth={1.8} className={styles.fieldIcon} />
                {profile.email}
              </p>
              <p className={styles.fieldLabel}>Phone</p>
              <p className={styles.fieldValue}>
                <Phone size={14} strokeWidth={1.8} className={styles.fieldIcon} />
                {profile.phone}
              </p>
              <p className={styles.fieldLabel}>Location</p>
              <p className={styles.fieldValue}>
                <MapPin size={14} strokeWidth={1.8} className={styles.fieldIcon} />
                {profile.location}
              </p>
              <p className={styles.fieldLabel}>Emergency Contact</p>
              <p className={styles.fieldValue}>
                <Phone size={14} strokeWidth={1.8} className={styles.fieldIcon} />
                {profile.emergencyContact}
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <main className={styles.rightContent}>
          <div className={styles.outerBox}>
            {/* NOTES */}
            <div className={styles.notesInnerBox}>
              <div className={styles.notesBoxHeader}>
                <div>
                  <h2 className={styles.notesTitle}>Notes:</h2>
                  <p className={styles.notesPerson}>{profile.fullName}</p>
                </div>
                {!isEditingNotes && (
                  <button
                    className={styles.editIconBtn}
                    onClick={() => setIsEditingNotes(true)}
                    aria-label="Edit notes"
                  >
                    <Pencil size={15} strokeWidth={2} />
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className={styles.notesEditArea}>
                  <textarea
                    className={styles.notesTextarea}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this volunteer…"
                    autoFocus
                  />
                  {saveError && <p className={styles.saveError}>{saveError}</p>}
                  <div className={styles.notesActions}>
                    <button className={styles.cancelNoteBtn} onClick={handleCancelEdit} disabled={isSaving}>
                      Cancel
                    </button>
                    <button className={styles.saveNoteBtn} onClick={handleSaveNotes} disabled={isSaving}>
                      {isSaving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {notes ? (
                    <ul className={styles.notesList}>
                      {notes
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, i) => (
                          <li key={i} className={styles.notesItem}>
                            {line}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className={styles.notesEmpty}>No notes yet.</p>
                  )}
                  {saveSuccess && <p className={styles.saveSuccess}>✓ Notes saved!</p>}
                </div>
              )}
            </div>

            {/* BOTTOM */}
            <div className={styles.bottomHalf}>
              {/* REGISTERED PROGRAMS */}
              <div className={styles.programsCol}>
                <h2 className={styles.sectionTitle}>{firstName}&apos;s Registered Programs</h2>
                <div className={styles.programList}>
                  {registeredEvents.length === 0 ? (
                    <p className={styles.statusMsg}>No registered events yet.</p>
                  ) : (
                    registeredEvents.map((event) => (
                      <div key={event.signupId} className={styles.programItem}>
                        <div className={styles.programItemTop}>
                          <span className={styles.programDate}>{formatDate(event.date)}</span>
                          <span
                            className={
                              event.status.toLowerCase() === "confirmed"
                                ? styles.confirmedBadge
                                : event.status.toLowerCase() === "cancelled"
                                  ? styles.cancelledBadge
                                  : styles.pendingBadge
                            }
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className={styles.programName}>{event.name}</p>
                        {event.status.toLowerCase() !== "cancelled" && (
                          <button className={styles.cancelBtn}>Cancel</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* STATS */}
              <div className={styles.statsCol}>
                <h2 className={styles.sectionTitle}>Stats</h2>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Month Joined</p>
                  <p className={styles.statValue}>{profile.monthJoined}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Total Volunteer Hours</p>
                  <p className={styles.statValue}>{profile.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
