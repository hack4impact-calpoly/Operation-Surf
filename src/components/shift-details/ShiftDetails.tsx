"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, ChevronDown, ChevronUp, Clock, Loader2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import styles from "@/styles/ShiftDetails.module.css";
import { authClient } from "@/lib/auth-client";

import { toGoogleMapsEmbed } from "@/components/shift-card/ShiftCard";

import { Roboto_Slab } from "next/font/google";
import { Inter } from "next/font/google";

// allow interchangeability between the two fonts
const roboto = Roboto_Slab({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

// TODO: remove when ready
const mockDay = {
  title: "Day 1 · Santa Cruz Food Runner",
  heroImage: "/op_surf_logo_no_bg.png",
  date: "March 22, 2026",
  dayOfWeek: "Sunday",
  location: "West Cliff Drive, Santa Cruz, CA, USA",
  description:
    "Our week-long program is an epic, life-changing adventure for our military and veterans. Bringing our participants directly to our programs within supportive coastal communities and exposing them to the healing power of the ocean. During this all-inclusive rehabilitative program, large steps of healing occur for injured military men and women from all over the nation – including addressing deep grief by honoring fallen brothers and sisters, learning to build trust with new people, and accomplishing goals. Your involvement helps make this possible. Every volunteer, every act of service, and every smile contributes to the powerful impact Operation Surf has on the lives of those who have sacrificed so much for our country.",
};

type Day = {
  name: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  programId: string;
  dayId: string;
  private: boolean;
  location?: string;
  description?: string;
};

type Shift = {
  name: string;
  description: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  location: string;
  locationInfo?: string;
  address?: string;
  directions?: string;
  mapLink?: string;
  shiftId: string;
  dayId: string;
  visibility: "public" | "invited";
  invited: string[];
  byoDescription?: string;
};

type ShiftDetailsProps = {
  dayId: string;
  day: Day;
  shifts: Shift[];
  registeredShiftIds: Set<string>;
  pendingSignupIds: Set<string>;
  onSignUp: (shiftIds: string[]) => void;
  shiftSignupCounts: Map<string, number>;
};

function formatShiftDate(date: string) {
  const newDate = new Date(date);

  return newDate.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ShiftDetails({
  dayId,
  day,
  shifts,
  registeredShiftIds,
  pendingSignupIds,
  shiftSignupCounts,
  onSignUp,
}: ShiftDetailsProps) {
  const [openShiftId, setOpenShiftId] = useState<string | null>(shifts[0]?.shiftId ?? null);
  const [selectedShiftIds, setSelectedShiftIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedShiftIds((current) => {
      const next = new Set(current);

      registeredShiftIds.forEach((shiftId) => {
        next.delete(shiftId);
      });

      return next;
    });
  }, [registeredShiftIds]);

  // getting day info
  const dayTitle = day.name;
  const dayDescriptionMissing = !day.description;

  // for auth
  const { data: session, isPending: loadingSession } = authClient.useSession();
  const userId = session?.user?.id;
  const signInError = !loadingSession && !userId ? "You must be signed in to sign up for a shift." : null;

  // visual for pending sign ups
  const selectedShiftIdsArray = Array.from(selectedShiftIds);
  const selectedShiftIsPending = selectedShiftIdsArray.some((shiftId) => pendingSignupIds.has(shiftId));

  return (
    <main className={styles.page}>
      <div className={inter.className}>
        <section className={styles.hero} aria-label="Shift details banner">
          <Image src="/hero-img.png" alt="" fill priority className={styles.heroBg} />
          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Shift Details</h1>
          </div>
        </section>

        <div className={styles.content}>
          <section className={styles.dayHeader} aria-labelledby="day-title">
            <h2 id="day-title" className={styles.dayTitle}>
              {dayTitle}
            </h2>

            <div className={styles.dayMeta}>
              <span className={styles.metaItem}>
                <Calendar size={15} aria-hidden="true" />
                {formatShiftDate(day.date)}
              </span>

              <span>·</span>

              <span>{day.dayOfWeek}</span>

              <span className={styles.metaItem}>
                <MapPin size={15} aria-hidden="true" />
                {shifts[0]?.location || "Location unavailable"}
              </span>
            </div>

            <p className={`${styles.dayDescription} ${dayDescriptionMissing ? styles.placeholderText : ""}`}>
              {day.description || "No description provided."}
            </p>
          </section>

          <section className={styles.shiftsSection} aria-labelledby="available-shifts-title">
            <h2 id="available-shifts-title" className={styles.sectionTitle}>
              Available Shifts
            </h2>

            <div className={styles.shiftList}>
              {shifts.length === 0 ? (
                <p className={styles.emptyMsg}>No shifts available for this day.</p>
              ) : (
                shifts.map((shift) => {
                  const isShiftPending = pendingSignupIds.has(shift.shiftId);

                  return (
                    <article
                      className={`${styles.shiftCard} ${isShiftPending ? styles.shiftCardLoading : ""}`}
                      key={shift.shiftId}
                      aria-busy={isShiftPending}
                    >
                      <div className={styles.shiftTop}>
                        <input
                          type="checkbox"
                          className={styles.shiftCheckbox}
                          aria-label={`Select ${shift.name}`}
                          checked={selectedShiftIds.has(shift.shiftId)}
                          disabled={isShiftPending}
                          onChange={() => {
                            setSelectedShiftIds((current) => {
                              const next = new Set(current);

                              if (next.has(shift.shiftId)) {
                                next.delete(shift.shiftId);
                              } else {
                                next.add(shift.shiftId);
                              }

                              return next;
                            });
                          }}
                        />

                        <div className={styles.shiftMain}>
                          <div className={styles.shiftTitleRow}>
                            <h3 className={styles.shiftTitle}>{shift.name}</h3>

                            <button
                              type="button"
                              className={styles.expandBtn}
                              aria-label={
                                openShiftId === shift.shiftId ? `Collapse ${shift.name}` : `Expand ${shift.name}`
                              }
                              aria-expanded={openShiftId === shift.shiftId}
                              onClick={() => {
                                setOpenShiftId(openShiftId === shift.shiftId ? null : shift.shiftId);
                              }}
                            >
                              {openShiftId === shift.shiftId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>

                          <p className={styles.shiftDescription}>{shift.description}</p>

                          <div className={styles.shiftDivider} />

                          <div className={styles.shiftMetaRow}>
                            <span className={styles.shiftMetaItem}>
                              <Calendar size={15} aria-hidden="true" />
                              {formatShiftDate(shift.date)}
                            </span>

                            <span className={styles.shiftMetaItem}>
                              <Clock size={15} aria-hidden="true" />
                              {shift.startTime} – {shift.endTime} (PST)
                            </span>

                            <span className={styles.spotsBadge}>
                              {registeredShiftIds.has(shift.shiftId) ? (
                                "Registered"
                              ) : isShiftPending ? (
                                <>
                                  <Loader2 className={styles.cardSpinner} size={13} aria-hidden="true" />
                                  Signing up...
                                </>
                              ) : (
                                `${shiftSignupCounts.get(shift.shiftId) ?? 0}/${shift.totalSlots} Spots`
                              )}
                            </span>
                          </div>

                          {openShiftId === shift.shiftId ? (
                            <div className={styles.expandedContent}>
                              {shift.mapLink ? (
                                <a
                                  href={shift.mapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.locationLine}
                                >
                                  <MapPin size={15} aria-hidden="true" />
                                  <span>{shift.address || shift.location}</span>
                                </a>
                              ) : (
                                <p className={styles.locationLine}>
                                  <MapPin size={15} aria-hidden="true" />
                                  <span>{shift.address || shift.location}</span>
                                </p>
                              )}

                              {/* map preview */}
                              {shift.mapLink ? (
                                <iframe
                                  src={toGoogleMapsEmbed(shift.mapLink)}
                                  title={`${shift.name} map`}
                                  loading="lazy"
                                  className={styles.mapPreview}
                                />
                              ) : (
                                <div className={styles.mapPlaceholder}>Map preview unavailable</div>
                              )}

                              {/* extra info section */}
                              <div className={styles.infoBlock}>
                                <h4>What should volunteers know about the location?</h4>
                                <p className={!shift.locationInfo ? styles.placeholderText : ""}>
                                  {shift.locationInfo || "No extra information provided."}
                                </p>
                              </div>

                              <div className={styles.infoBlock}>
                                <h4>What should volunteers bring/wear?</h4>
                                <p className={!shift.byoDescription ? styles.placeholderText : ""}>
                                  {shift.byoDescription || "No extra information provided."}
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
                  );
                })
              )}
            </div>
          </section>

          <button
            type="button"
            className={styles.signUpBtn}
            disabled={selectedShiftIds.size === 0 || selectedShiftIsPending}
            onClick={() => {
              onSignUp(selectedShiftIdsArray);
              setSelectedShiftIds(new Set());
            }}
          >
            {selectedShiftIsPending ? (
              <>
                <Loader2 className={styles.buttonSpinner} size={16} aria-hidden="true" />
                Signing Up...
              </>
            ) : (
              "Sign Up for Shift"
            )}
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
