"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/CreateEvent/CreateDay.module.css";
import { ClipboardList, MapPin, CalendarDays, Eye, FileText, Camera } from "lucide-react";
import { Roboto_Slab } from "next/font/google";
import CreateEventNavbar from "./CreateEventNavbar";

const roboto = Roboto_Slab({
  subsets: ["latin"],
});

const visibilityOptions = [
  { value: "listed", title: "Listed", text: "(Public access)" },
  { value: "unlisted", title: "Unlisted", text: "(Link only)" },
  { value: "private", title: "Private", text: "(Invite only)" },
];

type ProgramSummary = {
  programId: string;
  programName: string;
};

const initialFormState = {
  eventName: "",
  description: "",
  location: "",
  weekDay: "",
  parentProgram: "",
  visibility: "",
};

const formatDateInput = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getDayVisibility = (isPrivate?: boolean) => (isPrivate ? "private" : "listed");

export default function CreateDay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dayId = searchParams.get("dayId");
  const isEditMode = dayId !== null;

  const [formData, setFormData] = useState(initialFormState);
  const [photoName, setPhotoName] = useState("");
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [existingTimes, setExistingTimes] = useState({ startTime: "09:00", endTime: "17:00" });
  const [errors, setErrors] = useState({
    eventName: "",
    weekDay: "",
    parentProgram: "",
    visibility: "",
    photo: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const programLookup = useMemo(() => {
    return new Map(
      programs.flatMap((program) => [
        [program.programId, program],
        [program.programName, program],
      ]),
    );
  }, [programs]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const programsResponse = await fetch("/api/program", { cache: "no-store" });
        if (!programsResponse.ok) {
          throw new Error(`Failed to load programs: ${programsResponse.status}`);
        }

        const programsJson = (await programsResponse.json()) as {
          programs: Array<{ programId: string; programName: string }>;
        };

        if (!isMounted) return;

        setPrograms(
          programsJson.programs.map((program) => ({
            programId: program.programId,
            programName: program.programName,
          })),
        );

        if (isEditMode && dayId) {
          const dayResponse = await fetch(`/api/day/${encodeURIComponent(dayId)}`, { cache: "no-store" });
          if (!dayResponse.ok) {
            throw new Error(`Failed to load day: ${dayResponse.status}`);
          }

          const dayJson = (await dayResponse.json()) as {
            day: {
              name?: string;
              description?: string;
              location?: string;
              date?: string;
              programId?: string;
              private?: boolean;
              startTime?: string;
              endTime?: string;
            };
          };

          if (!isMounted) return;

          const matchedProgram = programsJson.programs.find((program) => program.programId === dayJson.day.programId);

          setFormData({
            eventName: dayJson.day.name ?? "",
            description: dayJson.day.description ?? "",
            location: dayJson.day.location ?? "",
            weekDay: dayJson.day.date ? formatDateInput(dayJson.day.date) : "",
            parentProgram: matchedProgram?.programName ?? dayJson.day.programId ?? "",
            visibility: getDayVisibility(dayJson.day.private),
          });
          setExistingTimes({
            startTime: dayJson.day.startTime ?? "09:00",
            endTime: dayJson.day.endTime ?? "17:00",
          });
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to load day.");
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
  }, [dayId, isEditMode]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "eventName" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, eventName: "" }));
    }
    if (name === "weekDay" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, weekDay: "" }));
    }
    if (name === "parentProgram" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, parentProgram: "" }));
    }
    if (name === "visibility" && value !== "") {
      setErrors((prev) => ({ ...prev, visibility: "" }));
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      setPhotoName("");
      setErrors((prev) => ({ ...prev, photo: "" }));
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      setPhotoName("");
      setErrors((prev) => ({
        ...prev,
        photo: "Photo must be a jpg, png, or webp file",
      }));
      return;
    }

    setPhotoName(file.name);
    setErrors((prev) => ({ ...prev, photo: "" }));
  }

  function formatWeekDayLabel(dateString: string) {
    if (!dateString) return "";

    const date = new Date(`${dateString}T00:00:00`);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const monthDayYear = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const dayOfMonth = date.getDate();
    const weekOfMonth = Math.ceil(dayOfMonth / 7);

    return `${weekday}, Week ${weekOfMonth} of ${monthDayYear}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = {
      eventName: formData.eventName.trim() === "" ? "Event name is required" : "",
      weekDay: formData.weekDay.trim() === "" ? "Week / Day must be selected" : "",
      parentProgram: formData.parentProgram.trim() === "" ? "Parent program is required" : "",
      visibility: formData.visibility === "" ? "Visibility must be selected" : "",
      photo: errors.photo,
    };

    setErrors(newErrors);
    setErrorMessage(null);

    const hasError = Object.values(newErrors).some((value) => value !== "");
    if (hasError) return;

    const matchedProgram = programLookup.get(formData.parentProgram.trim());
    if (!matchedProgram) {
      setErrors((prev) => ({ ...prev, parentProgram: "Choose an existing program by name or id" }));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.eventName,
        description: formData.description,
        location: formData.location,
        date: `${formData.weekDay}T00:00:00.000Z`,
        programId: matchedProgram.programId,
        private: formData.visibility !== "listed",
        startTime: existingTimes.startTime,
        endTime: existingTimes.endTime,
        ...(isEditMode ? {} : { dayId: crypto.randomUUID() }),
      };

      const endpoint = isEditMode ? `/api/day/${encodeURIComponent(dayId as string)}` : "/api/day";
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
        throw new Error(json.error ?? json.message ?? "Unable to save day.");
      }

      router.push("/opportunities");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save day.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageTitle = isEditMode ? "Edit Day" : "Add Day";
  const pageSubtitle = isEditMode ? "Update the event details for this day" : "Add a new event to your program";
  const submitLabel = isEditMode ? "Save Day" : "Add Day";

  return (
    <div className={roboto.className}>
      <div className={styles.page}>
        <CreateEventNavbar />

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <div className={styles.pageIntro}>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
              <p className={styles.pageSubtitle}>{pageSubtitle}</p>
            </div>

            <div className={styles.photoCard}>
              <label className={styles.label}>
                <Camera size={18} className={styles.labelIcon} />
                <span>Event Photo</span>
              </label>

              <label htmlFor="eventPhotoUpload" className={styles.uploadBox}>
                <div className={styles.uploadIcon}>
                  <Camera size={40} className={styles.labelIcon} />
                </div>
                <p className={styles.uploadTitle}>Upload Event Photo</p>
                <p className={styles.uploadText}>Drag and drop or click to browse</p>
                <p className={styles.uploadSubtext}>JPG, PNG, or WebP · Max 10MB</p>
                {photoName && <p className={styles.fileName}>{photoName}</p>}
              </label>

              <input
                id="eventPhotoUpload"
                className={styles.hiddenInput}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePhotoChange}
                disabled={isLoading || isSubmitting}
              />

              {errors.photo && <p className={styles.error}>{errors.photo}</p>}
              <p className={styles.photoHint}>A compelling image helps attract participants</p>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <form className={styles.card} onSubmit={handleSubmit}>
              <div className={styles.cardTopBar}></div>

              <div className={styles.cardBody}>
                {isLoading ? <p>Loading day...</p> : null}
                {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

                <div className={styles.field}>
                  <label className={styles.label}>
                    <ClipboardList size={18} className={styles.labelIcon} />
                    <span>
                      Event Name <span className={styles.required}>*</span>
                    </span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    name="eventName"
                    placeholder="e.g. Morning Surf Session"
                    value={formData.eventName}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                  {errors.eventName && <p className={styles.error}>{errors.eventName}</p>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    <FileText size={18} className={styles.labelIcon} />
                    <span>Description</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    name="description"
                    placeholder="Describe what participants can expect from this event..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.halfField}>
                    <label className={styles.label}>
                      <MapPin size={18} className={styles.labelIcon} />
                      <span>Location</span>
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      name="location"
                      placeholder="e.g. Pacific Beach"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={isLoading || isSubmitting}
                    />
                  </div>

                  <div className={styles.halfField}>
                    <label className={styles.label}>
                      <CalendarDays size={18} className={styles.labelIcon} />
                      <span>
                        Week / Day <span className={styles.required}>*</span>
                      </span>
                    </label>
                    <input
                      className={styles.input}
                      type="date"
                      name="weekDay"
                      value={formData.weekDay}
                      onChange={handleChange}
                      disabled={isLoading || isSubmitting}
                    />

                    {formData.weekDay && <p className={styles.helperText}>({formatWeekDayLabel(formData.weekDay)})</p>}
                    {errors.weekDay && <p className={styles.error}>{errors.weekDay}</p>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    <FileText size={18} className={styles.labelIcon} />
                    <span>
                      Parent Program <span className={styles.required}>*</span>
                    </span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    name="parentProgram"
                    list="parent-program-options"
                    placeholder="e.g. Adaptive Surf Therapy"
                    value={formData.parentProgram}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                  <datalist id="parent-program-options">
                    {programs.map((program) => (
                      <option key={program.programId} value={program.programName}>
                        {program.programId}
                      </option>
                    ))}
                  </datalist>
                  {errors.parentProgram && <p className={styles.error}>{errors.parentProgram}</p>}
                </div>

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

                <button className={styles.submitButton} type="submit" disabled={isLoading || isSubmitting}>
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
