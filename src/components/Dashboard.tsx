"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/Dashboard.module.css";

interface Profile {
  profileId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  emergencyContact: string;
}

interface Shift {
  shiftId: string;
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface RegisteredEvent {
  signupId: string;
  shiftId: string;
  name: string;
  date: string;
  status: string; 
}

interface DashboardProps {
  profile: Profile | null;
  shifts: Shift[];
  registeredEvents: RegisteredEvent[];
  registeredShiftIds: Set<string>; 
  loadingProfile: boolean;
  loadingShifts: boolean;
  loadingEvents: boolean;
  onSignUp: (shiftId: string) => void;
  onCancel: (signupId: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="2" width="14" height="13" rx="2" stroke="#9ca3af" strokeWidth="1.5" />
      <path d="M1 6h14" stroke="rgba(124, 120, 69, 1)" strokeWidth="1.5" />
      <path d="M5 1v2M11 1v2" stroke="rgba(124, 120, 69, 1)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Dashboard({
  profile,
  shifts,
  registeredEvents,
  registeredShiftIds,
  loadingProfile,
  loadingShifts,
  loadingEvents,
  onSignUp,
  onCancel,
}: DashboardProps) {

  return (
    <div className={styles.page}>

      {/* navbar */}
      <nav className={styles.navbar}>
        <img src="/operation-surf.png" alt="Operation Surf" className={styles.logoImg} />
        <div className={styles.navLinks}>
          <a href="/" className={styles.navLink}>Home</a>
          <a href="/programs" className={styles.navLink}>Programs</a>
          <a href="/notifications" className={styles.navLink}>Notifications</a>
          <a href="/account" className={styles.navLink}>My Account</a>
        </div>
      </nav>

      {/* hero header */}
      <header className={styles.hero}>
        <img src="/hero-img.png" alt="Dashboard background" className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>My Dashboard</h1>
          <p className={styles.heroSubtitle}>Manage your profile, events, and shifts</p>
        </div>
      </header>

      {/* main content */}
      <div className={styles.mainContent}>

        {/* left sidebar*/}
        <aside className={styles.sidebar}>
          {/* profile card */}
            <div className={styles.profileCard}>
            <div className={styles.profileCardHeader}>
                <h2 className={styles.profileCardTitle}>My Profile</h2>
                <button className={styles.editBtn} aria-label="Edit profile">✏️</button>
            </div>

            {loadingProfile && <p className={styles.statusMsg}>Loading profile...</p>}

            {!loadingProfile && !profile && (
                <p className={styles.statusMsg}>No profile found.</p>
            )}

            {!loadingProfile && profile && (
                <>
                {/* avatar circle with initials */}
                <div className={styles.avatarCircle}>
                    {profile.fullName.split(" ").map(n => n[0]).join("")}
                </div>

                <div className={styles.profileFields}>
                    <p className={styles.fieldLabel}>Full Name</p>
                    <p className={styles.fieldValue}>👤 {profile.fullName}</p>

                    <p className={styles.fieldLabel}>Email</p>
                    <p className={styles.fieldValue}>✉️ {profile.email}</p>

                    <p className={styles.fieldLabel}>Phone</p>
                    <p className={styles.fieldValue}>📞 {profile.phone}</p>

                    <p className={styles.fieldLabel}>Location</p>
                    <p className={styles.fieldValue}>📍 {profile.location}</p>

                    <p className={styles.fieldLabel}>Emergency Contact</p>
                    <p className={styles.fieldValue}>📞 {profile.emergencyContact}</p>
                </div>
                </>
            )}
            </div>

          {/* registered events card */}
            <div className={styles.registeredCard}>
            <h2 className={styles.registeredCardTitle}>My Registered Events</h2>

            {loadingEvents && <p className={styles.statusMsg}>Loading events...</p>}

            {!loadingEvents && registeredEvents.length === 0 && (
                <p className={styles.statusMsg}>No registered events yet.</p>
            )}

            {!loadingEvents && registeredEvents.map((event) => (
                <div key={event.signupId} className={styles.registeredEventItem}>
                <div className={styles.registeredEventTop}>
                    <span className={styles.registeredEventDate}>{event.date}</span>
                    <span className={styles.confirmedBadge}>{event.status}</span>
                </div>
                <p className={styles.registeredEventName}>{event.name}</p>
                <button
                    className={styles.cancelBtn}
                    onClick={() => onCancel(event.signupId)}
                    aria-label={`Cancel registration for ${event.name}`}
                >
                    Cancel
                </button>
                </div>
            ))}
            </div>
        </aside>

        {/* right content */}
        <main className={styles.eventsSection}>
          
            {/* available events */}
            <div className={styles.eventsCard}>
            <h2 className={styles.eventsCardTitle}>Available Events</h2>

            {loadingShifts && <p className={styles.statusMsg}>Loading events...</p>}

            {!loadingShifts && shifts.length === 0 && (
                <p className={styles.statusMsg}>No events available.</p>
            )}

            {!loadingShifts && shifts.map((shift) => {
                const isRegistered = registeredShiftIds.has(shift.shiftId);
                return (
                <div key={shift.shiftId} className={styles.shiftCard}>
                    <div className={styles.shiftCardLeft}>
                    <div className={styles.shiftCardHeader}>
                        <span className={styles.shiftDayOfWeek}>{shift.dayOfWeek}</span>
                        <span className={styles.shiftDate}>{formatDate(shift.date)}</span>
                    </div>
                    <p className={styles.shiftName}>{shift.name}</p>
                    <div className={styles.shiftTimeRow}>
                        <CalendarIcon />
                        <span className={styles.shiftTime}>{shift.startTime} - {shift.endTime}</span>
                    </div>
                    </div>

                    <div className={styles.shiftCardRight}>
                    {isRegistered ? (
                        <span className={styles.registeredBadge}>✓ Registered</span>
                    ) : (
                        <button
                        className={styles.signUpBtn}
                        onClick={() => onSignUp(shift.shiftId)}
                        aria-label={`Sign up for ${shift.name}`}
                        >
                        Sign Up for Event
                        </button>
                    )}
                    </div>
                </div>
                );
            })}
            </div>
        </main>

      </div>

    </div>
  );
}