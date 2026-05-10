"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/styles/Dashboard.module.css";
import { Home, Calendar, Bell, User, Pencil, Mail, Phone, MapPin, Clock, Check } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

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
    <div className={inter.className}>
      <div className={styles.page}>
        {/* navbar */}
        <nav className={styles.navbar}>
          <Image
            src="/op_surf_logo_no_bg.png"
            alt="Operation Surf Logo"
            width={58}
            height={46}
            className={styles.logoImg}
          />
          <div className={styles.navLinks}>
            <a href="/" className={styles.navLink}>
              <span className={styles.navIcon}>
                <Home />
              </span>
              Home
            </a>

            <a href="/programs" className={styles.navLink}>
              <span className={styles.navIcon}>
                <Calendar />
              </span>
              Programs
            </a>

            <a href="/notifications" className={styles.navLink}>
              <span className={styles.navIcon}>
                <Bell />
              </span>
              Notifications
            </a>

            <a href="/account" className={styles.navLink}>
              <span className={styles.navIcon}>
                <User />
              </span>
              My Account
            </a>
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

                <button className={styles.editBtn} aria-label="Edit profile">
                  <Pencil className={styles.icon} size={16} strokeWidth={2} />
                </button>
              </div>

              {loadingProfile && <p className={styles.statusMsg}>Loading profile...</p>}

              {!loadingProfile && !profile && <p className={styles.statusMsg}>No profile found.</p>}

              {!loadingProfile && profile && (
                <>
                  {/* avatar circle with initials */}
                  <div className={styles.avatarCircle}>
                    {profile.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div className={styles.profileFields}>
                    <p className={styles.fieldLabel}>Full Name</p>
                    <p className={styles.fieldValue}>
                      <User className={styles.icon} size={14} strokeWidth={1.8} />
                      {profile.fullName}
                    </p>

                    <p className={styles.fieldLabel}>Email</p>
                    <p className={styles.fieldValue}>
                      <Mail className={styles.icon} size={14} strokeWidth={1.8} />
                      {profile.email}
                    </p>

                    <p className={styles.fieldLabel}>Phone</p>
                    <p className={styles.fieldValue}>
                      <Phone className={styles.icon} size={14} strokeWidth={1.8} />
                      {profile.phone}
                    </p>

                    <p className={styles.fieldLabel}>Location</p>
                    <p className={styles.fieldValue}>
                      <MapPin className={styles.icon} size={14} strokeWidth={1.8} />
                      {profile.location}
                    </p>

                    <p className={styles.fieldLabel}>Emergency Contact</p>
                    <p className={styles.fieldValue}>
                      <Phone className={styles.icon} size={14} strokeWidth={1.8} />
                      {profile.emergencyContact}
                    </p>
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

              {!loadingEvents &&
                registeredEvents.map((event) => (
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

              {!loadingShifts && shifts.length === 0 && <p className={styles.statusMsg}>No events available.</p>}

              {!loadingShifts &&
                shifts.map((shift) => {
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
                          <Calendar className={styles.icon} size={14} strokeWidth={1.8} />
                          <span className={styles.shiftTime}>
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                      </div>

                      <div className={styles.shiftCardRight}>
                        {isRegistered ? (
                          <span className={styles.registeredBadge}>
                            <Check className={styles.icon} size={14} strokeWidth={2} />
                            Registered
                          </span>
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
    </div>
  );
}
