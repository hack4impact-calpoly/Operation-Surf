import Image from "next/image";

import { Calendar, ChevronDown, ChevronUp, Clock, Mail, MapPin, Phone, UserRound } from "lucide-react";
import GreyNavbar from "@/components/GreyNavbar";
import styles from "@/styles/ShiftDetails.module.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const mockDay = {
  title: "Day 1 · Santa Cruz Food Runner",
  heroImage: "/op_surf_logo_no_bg.png",
  date: "March 22, 2026",
  dayOfWeek: "Sunday",
  location: "West Cliff Drive, Santa Cruz, CA, USA",
  description:
    "Our week-long program is an epic, life-changing adventure for our military and veterans. Bringing our participants directly to our programs within supportive coastal communities and exposing them to the healing power of the ocean. During this all-inclusive rehabilitative program, large steps of healing occur for injured military men and women from all over the nation – including addressing deep grief by honoring fallen brothers and sisters, learning to build trust with new people, and accomplishing goals. Your involvement helps make this possible. Every volunteer, every act of service, and every smile contributes to the powerful impact Operation Surf has on the lives of those who have sacrificed so much for our country.",
};

const mockShifts = [
  {
    title: "Breakfast Pickup & Delivery",
    description:
      "This job entails picking up and delivering a breakfast order from various local vendors to Operation Surf Staff at the Dolphin Bay Resort.",
    date: "March 22 2026, Sunday",
    time: "7:00AM – 12:00PM (PST)",
    spots: "3/3 Spots",
    isOpen: false,
  },
  {
    title: "Lunch Pickup & Delivery",
    description:
      "This job entails picking up and delivering a lunch order from various local vendors to Operation Surf Staff at the Dolphin Bay Resort.",
    date: "March 22 2026, Sunday",
    time: "2:00PM – 3:00PM (PST)",
    spots: "2/3 Spots",
    isOpen: true,
  },
  {
    title: "Cleanup Support",
    description: "Help with cleanup, break down, and ensure the area is left better than we found it.",
    date: "March 22 2026, Sunday",
    time: "1:00PM – 3:00PM (PST)",
    spots: "6/6 Spots",
    isOpen: false,
  },
];

export default function ShiftDetails() {
  return (
    <main className={styles.page}>
      <div className={inter.className}>
        <GreyNavbar />

        <section className={styles.hero} aria-label="Shift details banner">
          <Image src={mockDay.heroImage} alt="" fill priority className={styles.heroBg} />
          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Shift Details</h1>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.dayHeader} aria-labelledby="day-title">
            <h2 id="day-title" className={styles.dayTitle}>
              {mockDay.title}
            </h2>

            <div className={styles.dayMeta}>
              <span className={styles.metaItem}>
                <Calendar size={15} aria-hidden="true" />
                {mockDay.date}
              </span>
              <span>·</span>
              <span>{mockDay.dayOfWeek}</span>
              <span>·</span>
              <span className={styles.metaItem}>
                <MapPin size={15} aria-hidden="true" />
                {mockDay.location}
              </span>
            </div>

            <p className={styles.dayDescription}>{mockDay.description}</p>
          </section>

          <section className={styles.shiftsSection} aria-labelledby="available-shifts-title">
            <h2 id="available-shifts-title" className={styles.sectionTitle}>
              Available Shifts
            </h2>

            <div className={styles.shiftList}>
              {mockShifts.map((shift) => (
                <article className={styles.shiftCard} key={shift.title}>
                  <div className={styles.shiftTop}>
                    <input type="checkbox" className={styles.shiftCheckbox} aria-label={`Select ${shift.title}`} />

                    <div className={styles.shiftMain}>
                      <div className={styles.shiftTitleRow}>
                        <h3 className={styles.shiftTitle}>{shift.title}</h3>

                        <button
                          type="button"
                          className={styles.expandBtn}
                          aria-label={shift.isOpen ? `Collapse ${shift.title}` : `Expand ${shift.title}`}
                        >
                          {shift.isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>

                      <p className={styles.shiftDescription}>{shift.description}</p>

                      <div className={styles.shiftDivider} />

                      <div className={styles.shiftMetaRow}>
                        <span className={styles.shiftMetaItem}>
                          <Calendar size={15} aria-hidden="true" />
                          {shift.date}
                        </span>

                        <span className={styles.shiftMetaItem}>
                          <Clock size={15} aria-hidden="true" />
                          {shift.time}
                        </span>

                        <span className={styles.spotsBadge}>{shift.spots}</span>
                      </div>

                      {shift.isOpen ? (
                        <div className={styles.expandedContent}>
                          <p className={styles.locationLine}>
                            <MapPin size={15} aria-hidden="true" />
                            <span>{mockDay.location}</span>
                          </p>

                          <div className={styles.mapPlaceholder}>Map preview placeholder</div>

                          <div className={styles.infoBlock}>
                            <h4>What should volunteers know about the location?</h4>
                            <p>
                              Our evening dinners are located in the Dream Inn located near Cowell&apos;s Beach in Santa
                              Cruz. Typically we are located in the Surf View Room. Exact room and other pertinent
                              information will go out the week prior to the start of the program. Please allow extra
                              time for parking, as it can be limited in the area.
                            </p>
                          </div>

                          <div className={styles.infoBlock}>
                            <h4>What will volunteers need to bring or wear?</h4>
                            <p>
                              This role simply requires reliable transportation and the ability to safely carry and
                              deliver food for groups of up to 50 people. Comfortable clothing and a positive attitude
                              are all you need!
                            </p>
                          </div>

                          <div className={styles.coordinatorBlock}>
                            <h4>VOLUNTEER COORDINATOR</h4>

                            <div className={styles.coordinatorRow}>
                              <div className={styles.avatar} aria-hidden="true">
                                <UserRound size={26} />
                              </div>

                              <div>
                                <p className={styles.coordinatorName}>John Mustang</p>
                                <p className={styles.coordinatorInfo}>
                                  <Mail size={13} aria-hidden="true" />
                                  john.mustang@email.com
                                </p>
                                <p className={styles.coordinatorInfo}>
                                  <Phone size={13} aria-hidden="true" />
                                  (555) 123-4567
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <button type="button" className={styles.signUpBtn}>
            Sign Up for Shift
          </button>

          <section className={styles.contactSection} aria-labelledby="contact-title">
            <h2 id="contact-title" className={styles.sectionTitle}>
              Who To Contact
            </h2>

            <p className={styles.contactName}>John Hallet (Operations Manager)</p>
            <p className={styles.contactInfo}>
              <Phone size={15} aria-hidden="true" />
              (805)-792-2094
            </p>
            <p className={styles.contactInfo}>
              <Mail size={15} aria-hidden="true" />
              john@operationsurf.org
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
