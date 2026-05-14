"use client";

import { CalendarDays, Check, ChevronDown, Home, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./CheckIn.module.css";

interface LiabilityWaiver {
  shiftId: string;
  accepted: boolean;
  acceptedAt?: Date | string;
  expiresAt?: Date | string;
}

interface IVolunteer {
  userId?: string; // Made optional to account for API differences
  _id?: string; // Added standard MongoDB id format
  id?: string; // Added standard SQL id format
  name: string;
  username: string;
  email: string;
  phone: string;
  sex: "female" | "male" | "intersex" | "prefer_not_to_say" | "other";
  birthday: Date | string;
  location: string;
  liabilityWaiver: LiabilityWaiver[];
  backgroundCheck: boolean;
  service?: string;
}

type AttendanceStatus = "checkedIn" | "absent";
type SortOption = "name" | "age" | "gender";

type Props = {
  params: {
    shiftId: string;
  };
};

const genderLabels: Record<IVolunteer["sex"], string> = {
  female: "Female",
  male: "Male",
  intersex: "Intersex",
  prefer_not_to_say: "Prefer not to say",
  other: "Other",
};

// Helper function to guarantee we have a unique ID for state tracking
function getUniqueId(person: IVolunteer): string {
  return person.userId || person._id || person.id || person.email || "";
}

function getAge(birthday: Date | string): number | "-" {
  const birthDate = new Date(birthday);

  if (Number.isNaN(birthDate.getTime())) {
    return "-";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  return birthdayHasPassed ? age : age - 1;
}

function formatGender(sex: IVolunteer["sex"]): string {
  return genderLabels[sex] || sex;
}

/* 
  Sub component for rendering each volunteer row in the attendance table, including status buttons
*/
function PersonRow(props: {
  person: IVolunteer;
  status?: AttendanceStatus;
  onStatusChange: (person: IVolunteer, status: AttendanceStatus) => void;
}) {
  const { person, status, onStatusChange } = props;

  return (
    <div className={styles.tableRow}>
      <div aria-hidden="true" />

      <div className={styles.personCell}>
        <span className={styles.personName}>{person.name}</span>
        <span className={styles.personEmail}>{person.email}</span>
      </div>

      <div className={styles.tableCell}>{getAge(person.birthday)}</div>
      <div className={styles.tableCell}>{formatGender(person.sex)}</div>
      <div className={styles.tableCell}>{person.phone}</div>

      <div className={styles.statusActions}>
        <button
          type="button"
          className={`${styles.statusButton} ${styles.checkButton} ${
            status === "checkedIn" ? styles.activeCheckButton : ""
          }`}
          onClick={() => onStatusChange(person, "checkedIn")}
          aria-label={`Check in ${person.name}`}
        >
          <Check size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`${styles.statusButton} ${styles.absentButton} ${
            status === "absent" ? styles.activeAbsentButton : ""
          }`}
          onClick={() => onStatusChange(person, "absent")}
          aria-label={`Mark ${person.name} absent`}
        >
          <X size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

const CheckIn = ({ params }: Props) => {
  const { shiftId } = params;

  const [volunteers, setVolunteers] = useState<IVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch("/api/volunteer");

        if (!response.ok) {
          throw new Error("Failed to fetch volunteers");
        }

        const data = await response.json();
        const volunteerList: IVolunteer[] = Array.isArray(data.volunteers) ? data.volunteers : [];
        const shiftVolunteers = volunteerList.filter((volunteer) =>
          Array.isArray(volunteer.liabilityWaiver)
            ? volunteer.liabilityWaiver.some((waiver) => waiver.shiftId === shiftId)
            : false,
        );

        // if there is no checkin data in localStorage for this shift, initialize it as an empty array
        if (!localStorage.getItem(`checkin-${shiftId}`)) {
          localStorage.setItem(`checkin-${shiftId}`, JSON.stringify([]));
        }

        const nonCheckedInVolunteers = shiftVolunteers.filter((volunteer) => {
          const uniqueId = getUniqueId(volunteer);
          const checkedInVolunteers: string[] = JSON.parse(localStorage.getItem(`checkin-${shiftId}`) || "[]");
          return !checkedInVolunteers.includes(uniqueId);
        });

        setVolunteers(nonCheckedInVolunteers);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch volunteers");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [shiftId]);

  const displayedVolunteers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredVolunteers = volunteers.filter((person) => {
      const uniqueId = getUniqueId(person);

      // remove volunteer from frontend if they are successfully checked in
      if (attendance[uniqueId] === "checkedIn") {
        // Update localStorage to persist check-in status across page reloads
        const checkedInVolunteers: string[] = JSON.parse(localStorage.getItem(`checkin-${shiftId}`) || "[]");
        if (!checkedInVolunteers.includes(uniqueId)) {
          localStorage.setItem(`checkin-${shiftId}`, JSON.stringify([...checkedInVolunteers, uniqueId]));
        }
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [person.name, person.email, person.phone, person.location, formatGender(person.sex)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });

    return [...filteredVolunteers].sort((first, second) => {
      if (sortBy === "age") {
        const firstAge = getAge(first.birthday);
        const secondAge = getAge(second.birthday);
        return Number(firstAge === "-" ? 0 : firstAge) - Number(secondAge === "-" ? 0 : secondAge);
      }

      if (sortBy === "gender") {
        return formatGender(first.sex).localeCompare(formatGender(second.sex));
      }

      return first.name.localeCompare(second.name);
    });
  }, [volunteers, searchTerm, sortBy, attendance]);

  //const checkedInCount = Object.values(attendance).filter((status) => status === "checkedIn").length;
  const checkedInCount = localStorage.getItem(`checkin-${shiftId}`)
    ? JSON.parse(localStorage.getItem(`checkin-${shiftId}`) || "[]").length
    : 0;
  const absentCount = Object.values(attendance).filter((status) => status === "absent").length;

  const handleStatusChange = (person: IVolunteer, status: AttendanceStatus) => {
    const uniqueId = getUniqueId(person);

    // Prevent updating if we somehow can't find a valid ID
    if (!uniqueId) return;

    setAttendance((currentAttendance) => ({
      ...currentAttendance,
      [uniqueId]: status,
    }));
  };

  const handleResetStatus = () => {
    setAttendance({});
    localStorage.removeItem(`checkin-${shiftId}`);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.navbar} aria-label="Primary navigation">
        <div className={styles.navInner}>
          <Link className={styles.logoLink} href="/" aria-label="Operation Surf home">
            <Image
              className={styles.logoImage}
              src="/op_surf_logo_no_bg.png"
              alt="Operation Surf"
              width={60}
              height={48}
              priority
            />
          </Link>

          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              <Home size={16} strokeWidth={2} aria-hidden="true" />
              <span>Home</span>
            </Link>
            <Link href="/programs" className={styles.navLink}>
              <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
              <span>Programs</span>
            </Link>
          </div>
        </div>
      </nav>

      <header className={styles.hero}>
        <Image
          className={styles.heroImage}
          src="/hero-img.png"
          alt="Operation Surf volunteers"
          fill
          sizes="100vw"
          priority
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Volunteer Check-In</h1>
          <p>Track and manage volunteer attendance for events</p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.toolbar} aria-label="Volunteer filters">
          <label className={styles.sortGroup}>
            <span>Sort By</span>
            <span className={styles.selectWrapper}>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                aria-label="Sort volunteers"
              >
                <option value="name">Name</option>
                <option value="age">Age</option>
                <option value="gender">Gender</option>
              </select>
              <ChevronDown size={14} strokeWidth={2.5} aria-hidden="true" />
            </span>
          </label>

          <label className={styles.searchGroup}>
            <Search size={18} strokeWidth={2} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, etc."
              aria-label="Search volunteers"
            />
          </label>
        </section>

        {error && <div className={styles.error}>{error}</div>}

        <section className={styles.tableCard} aria-label="Volunteer attendance table">
          <div className={styles.tableHeader}>
            <div aria-hidden="true" />
            <div>Full Name / Email</div>
            <div>Age</div>
            <div>Gender</div>
            <div>Contact</div>
            <div className={styles.statusHeader}>Status</div>
            <button className={styles.resetStatus} onClick={handleResetStatus}>
              Reset Status
            </button>
          </div>

          <div className={styles.tableBody}>
            {loading ? (
              <div className={styles.tableMessage}>Loading volunteers...</div>
            ) : displayedVolunteers.length > 0 ? (
              displayedVolunteers.map((person) => {
                const uniqueId = getUniqueId(person);
                return (
                  <PersonRow
                    key={uniqueId}
                    person={person}
                    status={attendance[uniqueId]}
                    onStatusChange={handleStatusChange}
                  />
                );
              })
            ) : (
              <div className={styles.tableMessage}>No volunteers pending check-in.</div>
            )}
          </div>
        </section>

        <section className={styles.statsGrid} aria-label="Attendance summary">
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Total Volunteers</span>
            <strong className={styles.totalNumber}>{volunteers.length}</strong>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Checked In</span>
            <strong className={styles.checkedNumber}>{checkedInCount}</strong>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Absent</span>
            <strong className={styles.absentNumber}>{absentCount}</strong>
          </article>
        </section>
      </main>
    </div>
  );
};

export default CheckIn;
