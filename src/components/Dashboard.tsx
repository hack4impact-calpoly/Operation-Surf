"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/styles/Dashboard.module.css";
import { Home, Calendar, Bell, User, Users, Pencil, Mail, Phone, MapPin, Clock, Check } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

interface Profile {
  profileId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  emergencyContact: EmergencyContact;
}

interface Shift {
  shiftId: string;
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface RegisteredDay {
  signupId: string;
  shiftId: string;
  name: string;
  date: string;
  status: string;
}

interface DashboardProps {
  profile: Profile | null;
  shifts: Shift[];
  registeredDays: RegisteredDay[];
  registeredShiftIds: Set<string>;
  loadingProfile: boolean;
  loadingShifts: boolean;
  loadingDays: boolean;
  onSignUp: (shiftId: string) => void;
  onCancel: (signupId: string) => void;
  onSaveProfile: (updatedProfile: Profile) => Promise<void>;
}

function formatDate(dateStr: string): string {
  const dateOnly = dateStr.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);
  const d = new Date(year, month - 1, day);

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

// for profile editing validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-() ]{7,20}$/;

function profilesMatch(a: Profile | null, b: Profile | null) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getProfileError(profile: Profile) {
  if (!profile.fullName.trim()) return "Full name is required.";
  if (!emailRegex.test(profile.email)) return "Please enter a valid email.";
  if (!phoneRegex.test(profile.phone)) return "Please enter a valid phone number.";
  if (!profile.location.trim()) return "Location is required.";

  if (!profile.emergencyContact.name.trim()) return "Emergency contact name is required.";
  if (!phoneRegex.test(profile.emergencyContact.phone)) return "Please enter a valid emergency contact phone.";
  if (!emailRegex.test(profile.emergencyContact.email)) return "Please enter a valid emergency contact email.";

  return "";
}

export default function Dashboard({
  profile,
  shifts,
  registeredDays,
  registeredShiftIds,
  loadingProfile,
  loadingShifts,
  loadingDays,
  onSignUp,
  onCancel,
  onSaveProfile,
}: DashboardProps) {
  // states for editing volunteer profile
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Profile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const profileError = profileForm ? getProfileError(profileForm) : "";
  const profileChanged = !profilesMatch(profile, profileForm);
  const canSubmitProfile = Boolean(profileForm && profileChanged && !profileError && !savingProfile);

  function updateProfileForm(field: keyof Profile, value: string) {
    if (!profileForm) return;

    setProfileForm({
      ...profileForm,
      [field]: value,
    });
  }

  async function handleProfileSave() {
    if (!profileForm || !canSubmitProfile) return;

    try {
      setSavingProfile(true);
      await onSaveProfile(profileForm);
      setEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  }

  function updateEmergencyContactForm(field: keyof EmergencyContact, value: string) {
    if (!profileForm) return;

    setProfileForm({
      ...profileForm,
      emergencyContact: {
        ...profileForm.emergencyContact,
        [field]: value,
      },
    });
  }

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
                <Home size={21} />
              </span>
              Home
            </a>

            <a href="/programs" className={styles.navLink}>
              <span className={styles.navIcon}>
                <Calendar size={21} />
              </span>
              Programs
            </a>

            <a href="/notifications" className={styles.navLink}>
              <span className={styles.navIcon}>
                <Bell size={21} />
              </span>
              Notifications
            </a>

            <a href="/account" className={styles.navLink}>
              <span className={styles.navIcon}>
                <User size={21} />
              </span>
              My Account
            </a>
          </div>
        </nav>

        {/* hero header */}
        <header className={styles.hero}>
          <Image src="/hero-img.png" alt="Dashboard background" fill className={styles.heroBg} />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>My Dashboard</h1>
            <p className={styles.heroSubtitle}>Manage your profile, days, and shifts</p>
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

                {/* profile editing */}
                <button
                  className={styles.editBtn}
                  aria-label="Edit profile"
                  onClick={() => {
                    setProfileForm(profile);
                    setEditingProfile(true);
                  }}
                  disabled={!profile}
                >
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

                    <div className={styles.emergencyContactFields}>
                      <div className={styles.fieldValue}>
                        <User className={styles.icon} size={14} />
                        <span>{profile.emergencyContact.name}</span>
                      </div>

                      <div className={styles.fieldValue}>
                        <Users className={styles.icon} size={14} />
                        <span className={profile.emergencyContact.relationship ? undefined : styles.emptyField}>
                          {profile.emergencyContact.relationship || "(Relationship not specified)"}
                        </span>
                      </div>

                      <div className={styles.fieldValue}>
                        <Phone className={styles.icon} size={14} />
                        <span>{profile.emergencyContact.phone}</span>
                      </div>

                      <div className={styles.fieldValue}>
                        <Mail className={styles.icon} size={14} />
                        <span>{profile.emergencyContact.email}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* registered days card */}
            <div className={styles.registeredCard}>
              <h2 className={styles.registeredCardTitle}>My Registered Days</h2>

              {loadingDays && <p className={styles.statusMsg}>Loading days...</p>}

              {!loadingDays && registeredDays.length === 0 && (
                <p className={styles.statusMsg}>No registered days yet.</p>
              )}

              {!loadingDays &&
                registeredDays.map((day) => (
                  <div key={day.signupId} className={styles.registeredDayItem}>
                    <div className={styles.registeredDayTop}>
                      <span className={styles.registeredDayDate}>{day.date}</span>
                      <span className={styles.confirmedBadge}>{day.status}</span>
                    </div>

                    <p className={styles.registeredDayName}>{day.name}</p>

                    <button
                      className={styles.cancelBtn}
                      onClick={() => onCancel(day.signupId)}
                      aria-label={`Cancel registration for ${day.name}`}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
            </div>
          </aside>

          {/* right content */}
          <main className={styles.daysSection}>
            {/* available days */}
            <div className={styles.daysCard}>
              <h2 className={styles.daysCardTitle}>Available Days</h2>

              {loadingShifts && <p className={styles.statusMsg}>Loading days...</p>}

              {!loadingShifts && shifts.length === 0 && <p className={styles.statusMsg}>No days available.</p>}

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
                          <Clock className={styles.icon} size={14} strokeWidth={1.8} />
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
                            Sign Up for Day
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </main>
        </div>

        {editingProfile && profileForm && (
          <div className={styles.modalOverlay}>
            <div className={styles.profileModal}>
              <h2 className={styles.modalTitle}>Edit Profile</h2>

              {profileChanged && profileError && <p className={styles.errorMsg}>{profileError}</p>}

              <h3 className={styles.modalSectionTitle}>My Profile</h3>
              <label className={styles.modalLabel}>
                <span className={styles.requiredStar}> * </span>
                Full Name
              </label>
              <input
                className={styles.modalInput}
                value={profileForm.fullName}
                onChange={(e) => updateProfileForm("fullName", e.target.value)}
              />

              <label className={styles.modalLabel}>
                <span className={styles.requiredStar}> * </span>
                Email
              </label>
              <input
                className={styles.modalInput}
                value={profileForm.email}
                onChange={(e) => updateProfileForm("email", e.target.value)}
              />

              <label className={styles.modalLabel}>
                <span className={styles.requiredStar}> * </span>
                Phone
              </label>
              <input
                className={styles.modalInput}
                value={profileForm.phone}
                onChange={(e) => updateProfileForm("phone", e.target.value)}
              />

              <label className={styles.modalLabel}>
                <span className={styles.requiredStar}> * </span>
                Location
              </label>
              <input
                className={styles.modalInput}
                value={profileForm.location}
                onChange={(e) => updateProfileForm("location", e.target.value)}
              />

              <br></br>
              <h3 className={styles.modalSectionTitle}>Emergency Contact</h3>

              <label className={styles.modalLabel}>
                <span className={styles.requiredStar}> * </span>
                Name
              </label>
              <input
                className={styles.modalInput}
                value={profileForm.emergencyContact.name}
                onChange={(e) => updateEmergencyContactForm("name", e.target.value)}
              />

              <label className={styles.modalLabel}>Relationship</label>
              <input
                className={styles.modalInput}
                value={profileForm.emergencyContact.relationship}
                onChange={(e) => updateEmergencyContactForm("relationship", e.target.value)}
              />

              <label className={styles.modalLabel}>
                <span className={styles.requiredStar}> * </span>
                Phone
              </label>
              <input
                className={styles.modalInput}
                value={profileForm.emergencyContact.phone}
                onChange={(e) => updateEmergencyContactForm("phone", e.target.value)}
              />

              <label className={styles.modalLabel}>
                <span className={styles.requiredStar}> * </span>
                Email
              </label>
              <input
                className={styles.modalInput}
                value={profileForm.emergencyContact.email}
                onChange={(e) => updateEmergencyContactForm("email", e.target.value)}
              />

              <div className={styles.modalButtons}>
                <button
                  className={styles.modalCancelBtn}
                  onClick={() => setEditingProfile(false)}
                  disabled={savingProfile}
                >
                  Cancel
                </button>

                <button className={styles.modalSaveBtn} onClick={handleProfileSave} disabled={!canSubmitProfile}>
                  {savingProfile ? "Saving..." : "Submit Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
