"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/CreateEvent/CreateShift.module.css";
import {
  UsersRound,
  FileText,
  MapPin,
  Clock3,
  Eye,
  CalendarDays,
  Settings2Icon,
  ClipboardListIcon,
  MapPlus,
} from "lucide-react";
import { Roboto_Slab } from "next/font/google";
import CreateEventToolbar from "./CreateEventToolbar";

const roboto = Roboto_Slab({
  subsets: ["latin"],
});

const visibilityOptions = [
  { value: "listed", title: "Listed", text: "(Public access)" },
  { value: "unlisted", title: "Unlisted", text: "(Link only)" },
  { value: "private", title: "Private", text: "(Invite only)" },
];

type DaySummary = {
  dayId: string;
  name: string;
};

const initialFormState = {
  shiftName: "",
  description: "",
  exactLocation: "",
  shiftDate: "",
  startTime: "",
  endTime: "",
  visibility: "",
  spots: "",
  parentEvent: "",
};

const formatDateInput = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getShiftVisibility = (value?: string) => (value === "public" ? "listed" : "private");
const toShiftApiVisibility = (value: string) => (value === "listed" ? "public" : "invited");

export default function CreateShift() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shiftId = searchParams.get("shiftId");
  const isEditMode = shiftId !== null;

  const [formData, setFormData] = useState(initialFormState);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [errors, setErrors] = useState({
    shiftName: "",
    shiftDate: "",
    startTime: "",
    endTime: "",
    visibility: "",
    spots: "",
    parentEvent: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayLookup = useMemo(() => {
    return new Map(
      days.flatMap((day) => [
        [day.dayId, day],
        [day.name, day],
      ]),
    );
  }, [days]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const daysResponse = await fetch("/api/day", { cache: "no-store" });
        if (!daysResponse.ok) {
          throw new Error(`Failed to load days: ${daysResponse.status}`);
        }

        const daysJson = (await daysResponse.json()) as {
          days: Array<{ dayId: string; name: string }>;
        };

        if (!isMounted) return;

        setDays(daysJson.days.map((day) => ({ dayId: day.dayId, name: day.name })));

        if (isEditMode && shiftId) {
          const shiftResponse = await fetch(`/api/shift/${encodeURIComponent(shiftId)}`, { cache: "no-store" });
          if (!shiftResponse.ok) {
            throw new Error(`Failed to load shift: ${shiftResponse.status}`);
          }

          const shiftJson = (await shiftResponse.json()) as {
            data: {
              name?: string;
              description?: string;
              location?: string;
              date?: string;
              startTime?: string;
              endTime?: string;
              visibility?: string;
              totalSlots?: number;
              dayId?: string;
            };
          };

          if (!isMounted) return;

          const matchedDay = daysJson.days.find((day) => day.dayId === shiftJson.data.dayId);

          setFormData({
            shiftName: shiftJson.data.name ?? "",
            description: shiftJson.data.description ?? "",
            exactLocation: shiftJson.data.location ?? "",
            shiftDate: shiftJson.data.date ? formatDateInput(shiftJson.data.date) : "",
            startTime: shiftJson.data.startTime ?? "",
            endTime: shiftJson.data.endTime ?? "",
            visibility: getShiftVisibility(shiftJson.data.visibility),
            spots: shiftJson.data.totalSlots !== undefined ? String(shiftJson.data.totalSlots) : "",
            parentEvent: matchedDay?.name ?? shiftJson.data.dayId ?? "",
          });
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to load shift.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, shiftId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "shiftName" && value.trim() !== "") setErrors((prev) => ({ ...prev, shiftName: "" }));
    if (name === "shiftDate" && value !== "") setErrors((prev) => ({ ...prev, shiftDate: "" }));
    if (name === "startTime" && value !== "") setErrors((prev) => ({ ...prev, startTime: "" }));
    if (name === "endTime" && value !== "") setErrors((prev) => ({ ...prev, endTime: "" }));
    if (name === "visibility" && value !== "") setErrors((prev) => ({ ...prev, visibility: "" }));
    if (name === "spots" && value.trim() !== "") setErrors((prev) => ({ ...prev, spots: "" }));
    if (name === "parentEvent" && value.trim() !== "") setErrors((prev) => ({ ...prev, parentEvent: "" }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = {
      shiftName: formData.shiftName.trim() === "" ? "Shift name is required" : "",
      shiftDate: formData.shiftDate === "" ? "Date is required" : "",
      startTime: formData.startTime === "" ? "Start time is required" : "",
      endTime:
        formData.endTime === ""
          ? "End time is required"
          : formData.startTime && formData.endTime <= formData.startTime
            ? "End time must be after start time"
            : "",
      visibility: formData.visibility === "" ? "Visibility must be selected" : "",
      spots: formData.spots.trim() === "" ? "# of spots is required" : "",
      parentEvent: formData.parentEvent.trim() === "" ? "Parent event is required" : "",
    };

    setErrors(newErrors);
    setErrorMessage(null);

    const hasError = Object.values(newErrors).some((value) => value !== "");
    if (hasError) return;

    const matchedDay = dayLookup.get(formData.parentEvent.trim());
    if (!matchedDay) {
      setErrors((prev) => ({ ...prev, parentEvent: "Choose an existing parent event by name or id" }));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.shiftName,
        description: formData.description,
        location: formData.exactLocation,
        date: `${formData.shiftDate}T00:00:00.000Z`,
        startTime: formData.startTime,
        endTime: formData.endTime,
        visibility: toShiftApiVisibility(formData.visibility),
        totalSlots: Number(formData.spots),
        dayId: matchedDay.dayId,
        invited: [],
        ...(isEditMode ? {} : { shiftId: crypto.randomUUID() }),
      };

      const endpoint = isEditMode ? `/api/shift/${encodeURIComponent(shiftId as string)}` : "/api/shift";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const json = (await response.json()) as { message?: string; error?: string };
        throw new Error(json.error ?? json.message ?? "Unable to save shift.");
      }

      router.push("/opportunities");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save shift.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageTitle = isEditMode ? "Edit Shift" : "Add Shift";
  const pageSubtitle = isEditMode
    ? "Update this volunteer opportunity and its scheduling details"
    : "Set up volunteer opportunities for your event";
  const submitLabel = isEditMode ? "Save Shift" : "Add Shift";

  return (
    <div className={roboto.className}>
      <div className={styles.page}>
        <CreateEventToolbar />

        <div className={styles.content}>
          <div className={styles.pageIntro}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <p className={styles.pageSubtitle}>{pageSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <ClipboardListIcon size={20} className={styles.labelIcon} />
                </div>
                <h2 className={styles.sectionTitle}>Basic Information</h2>
              </div>

              <div className={styles.sectionBody}>
                {isLoading ? <p>Loading shift...</p> : null}
                {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

                <div className={styles.field}>
                  <label className={styles.label}>
                    <UsersRound size={18} className={styles.labelIcon} />
                    <span>
                      Shift Name <span className={styles.required}>*</span>
                    </span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    name="shiftName"
                    placeholder="e.g. Volunteer Coordinator"
                    value={formData.shiftName}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                  {errors.shiftName && <p className={styles.error}>{errors.shiftName}</p>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    <FileText size={18} className={styles.labelIcon} />
                    <span>Description</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    name="description"
                    placeholder="Describe the shift responsibilities and expectations..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <MapPlus size={20} className={styles.labelIcon} />
                </div>
                <h2 className={styles.sectionTitle}>Location & Timing</h2>
              </div>

              <div className={styles.sectionBody}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <MapPin size={18} className={styles.labelIcon} />
                    <span>Exact Location</span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    name="exactLocation"
                    placeholder="e.g. 1234 Ocean Blvd, San Diego, CA 92101"
                    value={formData.exactLocation}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    <Clock3 size={18} className={styles.labelIcon} />
                    <span>
                      Day + Exact Time <span className={styles.required}>*</span>
                    </span>
                  </label>

                  <div className={styles.timeRow}>
                    <div className={styles.timeField}>
                      <input
                        className={styles.input}
                        type="date"
                        name="shiftDate"
                        value={formData.shiftDate}
                        onChange={handleChange}
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.shiftDate && <p className={styles.error}>{errors.shiftDate}</p>}
                    </div>

                    <div className={styles.timeField}>
                      <input
                        className={styles.input}
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.startTime && <p className={styles.error}>{errors.startTime}</p>}
                    </div>

                    <div className={styles.timeField}>
                      <input
                        className={styles.input}
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.endTime && <p className={styles.error}>{errors.endTime}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <Settings2Icon size={20} className={styles.labelIcon} />
                </div>
                <h2 className={styles.sectionTitle}>Settings & Details</h2>
              </div>

              <div className={styles.sectionBody}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    <Eye size={18} className={styles.labelIcon} />
                    <span>
                      Visibility <span className={styles.required}>*</span>
                    </span>
                  </label>

                  <div className={styles.visibilityRow}>
                    {visibilityOptions.map((option) => (
                      <label key={option.value} className={styles.visibilityCard}>
                        <input
                          type="radio"
                          name="visibility"
                          value={option.value}
                          checked={formData.visibility === option.value}
                          onChange={handleChange}
                          className={styles.radioInput}
                          disabled={isLoading || isSubmitting}
                        />
                        <div>
                          <p className={styles.visibilityTitle}>{option.title}</p>
                          <p className={styles.visibilityText}>{option.text}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {errors.visibility && <p className={styles.error}>{errors.visibility}</p>}
                </div>

                <div className={styles.row}>
                  <div className={styles.halfField}>
                    <label className={styles.label}>
                      <UsersRound size={18} className={styles.labelIcon} />
                      <span>
                        # of Spots <span className={styles.required}>*</span>
                      </span>
                    </label>
                    <input
                      className={styles.input}
                      type="number"
                      name="spots"
                      placeholder="e.g. 5"
                      value={formData.spots}
                      onChange={handleChange}
                      min="1"
                      disabled={isLoading || isSubmitting}
                    />
                    {errors.spots && <p className={styles.error}>{errors.spots}</p>}
                  </div>

                  <div className={styles.halfField}>
                    <label className={styles.label}>
                      <CalendarDays size={18} className={styles.labelIcon} />
                      <span>
                        Parent Event <span className={styles.required}>*</span>
                      </span>
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      name="parentEvent"
                      list="parent-event-options"
                      placeholder="e.g. Morning Surf Session"
                      value={formData.parentEvent}
                      onChange={handleChange}
                      disabled={isLoading || isSubmitting}
                    />
                    <datalist id="parent-event-options">
                      {days.map((day) => (
                        <option key={day.dayId} value={day.name}>
                          {day.dayId}
                        </option>
                      ))}
                    </datalist>
                    {errors.parentEvent && <p className={styles.error}>{errors.parentEvent}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button className={styles.submitButton} type="submit" disabled={isLoading || isSubmitting}>
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
