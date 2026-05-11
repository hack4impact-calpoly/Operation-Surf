"use client";
import styles from "./CheckIn.module.css";
import { useState, useEffect } from "react";

interface LiabilityWaiver {
  shiftId: string;
  accepted: boolean;
  acceptedAt?: Date;
  // annual renewal logic uses acceptedAt + expiresAt
  expiresAt?: Date;
}

interface IVolunteer {
  // Basic bio
  // userId to join on user/account tables
  userId: string;
  name: string;
  username: string;
  email: string;
  phone: string;

  birthday: Date;
  location: string;

  // Liability waiver logic
  liabilityWaiver: LiabilityWaiver[]; // must be accepted to sign up for any shift

  backgroundCheck: boolean;
}

function PersonRow({ person, onCheckin, onAbsent }) {
  return (
    <div className={styles.container19}>
      <div className={styles.container20}>
        <div className={styles.container21}>
          <div className={styles.text}></div>

          <div className={styles.container22}>
            <div
              className={styles.imageLoydSmith}
              style={person.imageUrl ? { backgroundImage: `url(${person.imageUrl})` } : undefined}
            ></div>
          </div>
        </div>

        <div className={styles.container23}>
          <div className={styles.container24}>
            <div className={styles.loydSmith}>{person.name}</div>
          </div>

          <div className={styles.container25}>
            <div className={styles.loyd123GmailCom}>{person.email}</div>
          </div>
        </div>

        <div className={styles.container26}>
          <div className={styles.two5}>{person.age}</div>
        </div>

        <div className={styles.container27}>
          <div className={styles.male}>{person.gender}</div>
        </div>

        <div className={styles.container28}>
          <div className={styles.nine16428783}>{person.phone}</div>
        </div>

        <div className={styles.container29}>
          <div className={styles.dinnerPickup}>{person.service}</div>
        </div>

        <div className={styles.container30}>
          <button type="button" className={styles.button2} onClick={() => onCheckin(person)}>
            <img className={styles.icon4} src="/icon3.svg" alt="Check-in" />
          </button>

          <button type="button" className={styles.button3} onClick={() => onAbsent(person)}>
            <img className={styles.icon5} src="/icon4.svg" alt="Mark Absent" />
          </button>
        </div>
      </div>
    </div>
  );
}

type Props = {
  params: {
    shiftId: string;
  };
};

const CheckIn = ({ params }: Props) => {
  const { shiftId } = params;

  const [volunteers, setVolunteers] = useState<IVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedIn, setCheckedIn] = useState<IVolunteer[]>([]);
  const [absent, setAbsent] = useState<IVolunteer[]>([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch("/api/volunteer");
        if (!response.ok) {
          throw new Error("Failed to fetch volunteers");
        }
        const data = await response.json();
        console.log(data);
        const allVolunteers = data.volunteers.filter((volunteer: IVolunteer) =>
          volunteer.liabilityWaiver.some((waiver) => waiver.shiftId === shiftId),
        );
        console.log(allVolunteers);
        console.log(shiftId);
        setVolunteers(allVolunteers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [shiftId]);

  const handleCheckin = (person: IVolunteer) => {
    // Implement check-in functionality here
    console.log("Check-in person:", person);
    let newCheckedIn = [...checkedIn, person];
    setCheckedIn(newCheckedIn);
  };

  const handleAbsent = (person: IVolunteer) => {
    // Implement absent functionality here
    console.log("Mark as absent person:", person);
    let newAbsent = [...absent, person];
    setAbsent(newAbsent);
  };

  return (
    <div className={styles.volunteerCheckinUpdated}>
      <div className={styles.volunteerCheckIn}>
        <div className={styles.container}>
          <img className={styles.container2} src="container1.png" />
          <div className={styles.container3}></div>
          <div className={styles.container4}>
            <div className={styles.heading1}>
              <div className={styles.volunteerCheckIn2}>Volunteer Check-In </div>
            </div>
            <div className={styles.paragraph}>
              <div className={styles.trackAndManageVolunteerAttendanceForEvents}>
                Track and manage volunteer attendance for events{" "}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.container5}>
          <div className={styles.container6}>
            <div className={styles.container7}>
              <div className={styles.container8}>
                <div className={styles.label}>
                  <div className={styles.sortBy}>Sort By </div>
                  <div className={styles.container9}>
                    <div className={styles.dropdown}>
                      <div className={styles.option}></div>
                      <div className={styles.option}></div>
                      <div className={styles.option}></div>
                    </div>
                    <img className={styles.icon} src="icon0.svg" />
                  </div>
                </div>
              </div>
              <div className={styles.container10}>
                <div className={styles.textInput}>
                  <div className={styles.searchEventLocationEtc}>Search event, location etc. </div>
                </div>
                <img className={styles.icon2} src="icon1.svg" />
              </div>

              <div className={styles.button}>
                <img className={styles.icon3} src="icon2.svg" />
                <div className={styles.filter}>Filter </div>
              </div>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.container11}>
            <div className={styles.container12}>
              <div className={styles.container13}>
                <div className={styles.fullNameEmail}>Full Name / Email </div>
              </div>
              <div className={styles.container14}>
                <div className={styles.age}>Age </div>
              </div>
              <div className={styles.container15}>
                <div className={styles.gender}>Gender </div>
              </div>
              <div className={styles.container16}>
                <div className={styles.contact}>Contact </div>
              </div>
              <div className={styles.container17}>
                <div className={styles.role}>Role </div>
              </div>
              <div className={styles.container18}>
                <div className={styles.status}>Status </div>
              </div>
            </div>
            <div>
              {volunteers.map((person: IVolunteer) => (
                <PersonRow key={person.userId} person={person} onCheckin={handleCheckin} onAbsent={handleAbsent} />
              ))}
            </div>
          </div>
          <div className={styles.container32}>
            <div className={styles.container33}>
              <div className={styles.container25}>
                <div className={styles.totalVolunteers}>Total Volunteers </div>
              </div>
              <div className={styles.container34}>
                <div className={styles.six}>{volunteers.length}</div>
              </div>
            </div>
            <div className={styles.container35}>
              <div className={styles.container25}>
                <div className={styles.checkedIn}>Checked In </div>
              </div>
              <div className={styles.container34}>
                <div className={styles.zero}>{checkedIn.length} </div>
              </div>
            </div>
            <div className={styles.container36}>
              <div className={styles.container25}>
                <div className={styles.absent}>Absent </div>
              </div>
              <div className={styles.container34}>
                <div className={styles.zero2}>{absent.length} </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.volunteerCheckIn3}>
        <div className={styles.container37}>
          <img className={styles.imageOperationSurfLogo} src="image-operation-surf-logo0.png" />
          <div className={styles.container38}>
            <div className={styles.button4}>
              <img className={styles.icon16} src="icon15.svg" />
              <div className={styles.text2}>
                <div className={styles.home}>Home </div>
              </div>
            </div>
            <div className={styles.button5}>
              <img className={styles.icon17} src="icon16.svg" />
              <div className={styles.text2}>
                <div className={styles.programs}>Programs </div>
              </div>
            </div>
            <div className={styles.button6}>
              <img className={styles.icon18} src="icon17.svg" />
              <div className={styles.text2}>
                <div className={styles.notifications}>Notifications </div>
              </div>
            </div>
            <div className={styles.button7}>
              <img className={styles.icon19} src="icon18.svg" />
              <div className={styles.text2}>
                <div className={styles.myAccount}>My Account </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.navigation}>
        <div className={styles.container39}>
          <img className={styles.frame} src="frame0.png" />
          <div className={styles.container40}>
            <div className={styles.button8}>
              <img className={styles.icon20} src="icon19.svg" />
              <div className={styles.text2}>
                <div className={styles.home2}>Home </div>
              </div>
            </div>
            <div className={styles.button9}>
              <img className={styles.icon21} src="icon20.svg" />
              <div className={styles.text2}>
                <div className={styles.programs2}>Programs </div>
              </div>
            </div>
            <div className={styles.button10}>
              <img className={styles.icon22} src="icon21.svg" />
              <div className={styles.text2}>
                <div className={styles.myAccount2}>My Account </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
