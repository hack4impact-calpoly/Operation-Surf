"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./CheckIn.module.css";

interface LiabilityWaiver {
  shiftId: string;
  accepted: boolean;
  acceptedAt?: Date | string;
  expiresAt?: Date | string;
}

interface IVolunteer {
  signupId?: string;
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
  liabilityWaiver?: LiabilityWaiver[];
  backgroundCheck: boolean;
  service?: string;
}

type ApiSignup = {
  signupId: string;
  shiftId: string;
  profileId: string;
};

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

function getStorageKey(shiftId: string): string {
  return `checkin-${shiftId}`;
}

function readCheckedInIds(shiftId: string): string[] {
  if (typeof window === "undefined") return [];

  const storageKey = getStorageKey(shiftId);
  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    window.localStorage.setItem(storageKey, JSON.stringify([]));
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.filter((id): id is string => typeof id === "string") : [];
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify([]));
    return [];
  }
}

function writeCheckedInIds(shiftId: string, checkedInIds: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(shiftId), JSON.stringify(Array.from(checkedInIds)));
}

function buildSignupOnlyVolunteer(signup: ApiSignup): IVolunteer {
  return {
    signupId: signup.signupId,
    userId: signup.profileId,
    name: "Unknown volunteer",
    username: "",
    email: signup.profileId,
    phone: "-",
    sex: "prefer_not_to_say",
    birthday: "",
    location: "",
    backgroundCheck: false,
  };
}

function mergeSignupVolunteer(signup: ApiSignup, volunteer?: IVolunteer): IVolunteer {
  if (!volunteer) return buildSignupOnlyVolunteer(signup);

  return {
    ...volunteer,
    signupId: signup.signupId,
    userId: volunteer.userId ?? signup.profileId,
    name: volunteer.name || "Unknown volunteer",
    username: volunteer.username || "",
    email: volunteer.email || signup.profileId,
    phone: volunteer.phone || "-",
    sex: volunteer.sex || "prefer_not_to_say",
    birthday: volunteer.birthday || "",
    location: volunteer.location || "",
    backgroundCheck: Boolean(volunteer.backgroundCheck),
  };
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
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      setError("");

      try {
        const [signupResponse, volunteerResponse] = await Promise.all([
          fetch(`/api/signup?shiftId=${encodeURIComponent(shiftId)}`, { cache: "no-store" }),
          fetch("/api/volunteer", { cache: "no-store" }),
        ]);

        if (!signupResponse.ok) {
          throw new Error("Failed to fetch shift signups");
        }

        if (!volunteerResponse.ok) {
          throw new Error("Failed to fetch volunteers");
        }

        const [signupData, volunteerData] = await Promise.all([signupResponse.json(), volunteerResponse.json()]);
        const signupList: ApiSignup[] = Array.isArray(signupData.signups) ? signupData.signups : [];
        const volunteerList: IVolunteer[] = Array.isArray(volunteerData.volunteers) ? volunteerData.volunteers : [];

        const volunteersByUserId = new Map<string, IVolunteer>();
        volunteerList.forEach((volunteer) => {
          const uniqueId = getUniqueId(volunteer);
          if (uniqueId) volunteersByUserId.set(uniqueId, volunteer);
        });

        const seenVolunteerIds = new Set<string>();
        const shiftVolunteers = signupList.reduce<IVolunteer[]>((roster, signup) => {
          const volunteer = mergeSignupVolunteer(signup, volunteersByUserId.get(signup.profileId));
          const uniqueId = getUniqueId(volunteer);

          if (!uniqueId || seenVolunteerIds.has(uniqueId)) {
            return roster;
          }

          seenVolunteerIds.add(uniqueId);
          roster.push(volunteer);
          return roster;
        }, []);

        const rosterIds = new Set(shiftVolunteers.map((volunteer) => getUniqueId(volunteer)).filter(Boolean));
        const storedCheckedInIds = readCheckedInIds(shiftId).filter((id) => rosterIds.has(id));

        setVolunteers(shiftVolunteers);
        setCheckedInIds(new Set(storedCheckedInIds));
        setAttendance({});
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

      if (checkedInIds.has(uniqueId)) {
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
  }, [volunteers, searchTerm, sortBy, checkedInIds]);

  const checkedInCount = checkedInIds.size;
  const absentCount = Object.values(attendance).filter((status) => status === "absent").length;

  const handleStatusChange = (person: IVolunteer, status: AttendanceStatus) => {
    const uniqueId = getUniqueId(person);

    // Prevent updating if we somehow can't find a valid ID
    if (!uniqueId) return;

    if (status === "checkedIn") {
      setAttendance((currentAttendance) => {
        const nextAttendance = { ...currentAttendance };
        delete nextAttendance[uniqueId];
        return nextAttendance;
      });

      setCheckedInIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(uniqueId);
        writeCheckedInIds(shiftId, nextIds);
        return nextIds;
      });

      return;
    }

    setAttendance((currentAttendance) => ({
      ...currentAttendance,
      [uniqueId]: status,
    }));
  };

  const handleResetStatus = () => {
    setAttendance({});
    setCheckedInIds(new Set());

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(getStorageKey(shiftId));
    }
  };

  return (
    <div className={styles.page}>
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
