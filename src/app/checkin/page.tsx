"use client";
import { type HTMLAttributes, useEffect, useState } from "react";
import styles from "./CheckIn.module.css";

type VolunteerStatus = "Pending" | "Checked In" | string;

type Volunteer = {
  id: string | number;
  fullName?: string;
  email?: string;
  age?: string | number;
  gender?: string;
  shift?: string;
  address?: string;
  status?: VolunteerStatus;
};

type VolunteerInfoBarProps = {
  className?: string;
  property1?: "pending-checkbox-fill" | string;
  fullName?: string;
  email?: string;
  age?: string | number;
  gender?: string;
  shift?: string;
  address?: string;
  status?: VolunteerStatus;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const VolunteerInfoBarProperty1PendingCheckboxFill = ({
  className = "",
  property1 = "pending-checkbox-fill",
  fullName = "",
  email = "",
  age = "",
  gender = "",
  shift = "",
  address = "",
  status = "Pending",
  checked = false,
  onCheckedChange,
}: VolunteerInfoBarProps) => {
  const isPending = status?.toLowerCase() === "pending";

  return (
    <div className={`${styles.volunteerInfoBar} ${className}`} data-property1={property1}>
      <div className={styles.fullNameEmail}>
        <div className={styles.fullName}>{fullName}</div>
        <div className={styles.email}>{email}</div>
      </div>

      <div className={styles.age}>{age}</div>

      <div className={styles.gender}>{gender}</div>

      <div className={styles.shift}>{shift}</div>

      <div className={styles.address}>{address}</div>

      <div className={styles.statusWrapper}>
        <span
          className={
            isPending ? `${styles.statusBadge} ${styles.pending}` : `${styles.statusBadge} ${styles.checkedIn}`
          }
        >
          {status}
        </span>

        <input
          className={styles.checkbox}
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          aria-label={`Check in ${fullName || "volunteer"}`}
        />
      </div>
    </div>
  );
};

type CheckInProps = HTMLAttributes<HTMLDivElement>;

const CheckIn = ({ ...props }: CheckInProps) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/volunteers", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch volunteers.");
        }

        const data = (await response.json()) as Volunteer[];

        setVolunteers(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchVolunteers();

    return () => controller.abort();
  }, []);

  return (
    <div className={`${styles.checkIn} ${className}`} {...props}>
      <div className={styles.frame228}>
        <div className={styles.frame224}>
          <div className={styles.frame227}>
            <div className={styles.frame218}>
              <div className={styles.fullNameEmail}>Full Name/ Email</div>
            </div>

            <div className={styles.frame219}>
              <div className={styles.age}>Age</div>
            </div>

            <div className={styles.frame220}>
              <div className={styles.gender}>Gender</div>
            </div>

            <div className={styles.frame221}>
              <div className={styles.shift}>Shift</div>
            </div>

            <div className={styles.frame222}>
              <div className={styles.address}>Address</div>
            </div>

            <div className={styles.frame223}>
              <div className={styles.status}>Status</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.volunteerList}>
        {loading && <div>Loading volunteers...</div>}

        {!loading && error && <div>{error}</div>}

        {!loading && !error && volunteers.length === 0 && <div>No volunteers found.</div>}

        {!loading &&
          !error &&
          volunteers.map((volunteer) => (
            <VolunteerInfoBarProperty1PendingCheckboxFill
              key={volunteer.id}
              property1="pending-checkbox-fill"
              fullName={volunteer.fullName}
              email={volunteer.email}
              age={volunteer.age}
              gender={volunteer.gender}
              shift={volunteer.shift}
              address={volunteer.address}
              status={volunteer.status}
              className={styles.volunteerInfoBarInstance}
            />
          ))}
      </div>

      <div className={styles.navigation}>
        <div className={styles.container}>
          <img className={styles.frame} src="frame0.png" alt="" />

          <div className={styles.container2}>
            <div className={styles.button}>
              <img className={styles.icon} src="icon0.svg" alt="" />
              <div className={styles.text}>
                <div className={styles.home}>Home</div>
              </div>
            </div>

            <div className={styles.button2}>
              <img className={styles.icon2} src="icon1.svg" alt="" />
              <div className={styles.text}>
                <div className={styles.programs}>Programs</div>
              </div>
            </div>

            <div className={styles.button3}>
              <img className={styles.icon3} src="icon2.svg" alt="" />
              <div className={styles.text}>
                <div className={styles.myAccount}>My Account</div>
              </div>
            </div>

            <div className={styles.button4}>
              <img className={styles.icon4} src="icon3.svg" alt="" />
              <div className={styles.text2}>
                <div className={styles.notifications}>Notifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={styles.frame255}
        style={{
          background: "url(frame-2550.png) center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className={styles.rectangle1744}></div>
        <div className={styles.volunteerCheckIn}>Volunteer Check-In</div>
      </div>

      <div className={styles.frame197}>
        <div className={styles.sortBy}>
          <div className={styles.frame148}>
            <div className={styles.sortBy2}>Sort By</div>
            <img className={styles.teenyiconsDownOutline} src="teenyicons-down-outline0.svg" alt="" />
          </div>
        </div>

        <div className={styles.dashiconsEmailAlt}>
          <img className={styles.vector} src="vector0.svg" alt="" />
          <img className={styles.materialSymbolsLightDownload} src="material-symbols-light-download0.svg" alt="" />
        </div>

        <div className={styles.search}>
          <div className={styles.frame147}>
            <img className={styles.materialSymbolsLightSearch} src="material-symbols-light-search0.svg" alt="" />
            <div className={styles.searchEventLocationEtc}>Search event, location etc.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
