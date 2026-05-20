"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/CreateEvent/CreateProgram.module.css";
import { ClipboardList, MapPin, CalendarDays, Eye, Upload, FileText } from "lucide-react";
import { Roboto_Slab } from "next/font/google";
import CreateEventNavbar from "./CreateEventNavbar";

const roboto = Roboto_Slab({
  subsets: ["latin"],
});

const visibilityOptions = [
  {
    value: "listed",
    title: "Listed",
    text: "Publicly visible to all users on the platform",
  },
  {
    value: "unlisted",
    title: "Unlisted",
    text: "Accessible via direct link only",
  },
  {
    value: "private",
    title: "Private",
    text: "Only visible to invited participants",
  },
];

const initialFormState = {
  programName: "",
  description: "",
  location: "",
  month: "",
  visibility: "",
};

const formatMonthInput = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const getDurationFromMonth = (monthValue: string) => {
  const date = new Date(`${monthValue}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return monthValue;

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const getProgramVisibility = (program: { private?: boolean; ghost_program?: boolean }) => {
  if (program.private) return "private";
  if (program.ghost_program) return "unlisted";
  return "listed";
};

const getProgramPrivacyFlags = (visibility: string) => ({
  private: visibility === "private",
  ghost_program: visibility === "unlisted",
});

export default function CreateProgram() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId");
  const isEditMode = programId !== null;

  const [formData, setFormData] = useState(initialFormState);
  const [photoName, setPhotoName] = useState("");
  const [errors, setErrors] = useState({
    programName: "",
    month: "",
    visibility: "",
    photo: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !programId) return;

    let isMounted = true;

    async function loadProgram() {
      try {
        const response = await fetch(`/api/program/${encodeURIComponent(programId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load program: ${response.status}`);
        }

        const json = (await response.json()) as {
          program: {
            programName?: string;
            description?: string;
            location?: string;
            date?: string;
            private?: boolean;
            ghost_program?: boolean;
            imageURI?: string;
          };
        };

        if (!isMounted) return;

        setFormData({
          programName: json.program.programName ?? "",
          description: json.program.description ?? "",
          location: json.program.location ?? "",
          month: json.program.date ? formatMonthInput(json.program.date) : "",
          visibility: getProgramVisibility(json.program),
        });
        setPhotoName(json.program.imageURI ?? "");
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to load program.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProgram();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, programId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "programName" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, programName: "" }));
    }

    if (name === "month" && value !== "") {
      setErrors((prev) => ({ ...prev, month: "" }));
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = {
      programName: formData.programName.trim() === "" ? "Program name is required" : "",
      month: formData.month === "" ? "Month must be selected" : "",
      visibility: formData.visibility === "" ? "Visibility must be selected" : "",
      photo: errors.photo,
    };

    setErrors(newErrors);
    setErrorMessage(null);

    const hasError = Object.values(newErrors).some((value) => value !== "");
    if (hasError) return;

    setIsSubmitting(true);

    try {
      const visibilityFlags = getProgramPrivacyFlags(formData.visibility);
      const payload = {
        imageURI: "/hero-img.png",
        location: formData.location,
        date: `${formData.month}-01T00:00:00.000Z`,
        duration: getDurationFromMonth(formData.month),
        programName: formData.programName,
        description: formData.description,
        ...visibilityFlags,
        ...(isEditMode ? {} : { programId: crypto.randomUUID() }),
      };

      const endpoint = isEditMode ? `/api/program/${encodeURIComponent(programId as string)}` : "/api/program";
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
        throw new Error(json.error ?? json.message ?? "Unable to save program.");
      }

      router.push("/opportunities");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save program.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageTitle = isEditMode ? "Edit Program" : "Add Program";
  const submitLabel = isEditMode ? "Save Program" : "Add Program";
  const subtitle = isEditMode
    ? "Update your program details and visibility settings"
    : "Set up a new program to organize events and opportunities";

  return (
    <div className={roboto.className}>
      <div className={styles.page}>
        <CreateEventNavbar />

        <div className={styles.formWrapper}>
          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.cardHeader}>
              <div className={styles.titleRow}>
                <div className={styles.titleIcon}>
                  <ClipboardList size={18} className={styles.labelIcon} />
                </div>

                <div>
                  <h1 className={styles.title}>{pageTitle}</h1>
                  <p className={styles.subtitle}>{subtitle}</p>
                </div>
              </div>
            </div>

            <div className={styles.cardBody}>
              {isLoading ? <p>Loading program...</p> : null}
              {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

              <div className={styles.field}>
                <label className={styles.label}>
                  <FileText size={18} className={styles.labelIcon} />
                  <span>
                    Program Name <span className={styles.required}>*</span>
                  </span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  name="programName"
                  placeholder="e.g. Adaptive Surf Therapy"
                  value={formData.programName}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                />
                {errors.programName && <p className={styles.error}>{errors.programName}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <FileText size={18} className={styles.labelIcon} />
                  <span>Description</span>
                </label>
                <textarea
                  className={styles.textarea}
                  name="description"
                  placeholder="Describe the program, its goals, and what participants can expect..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading || isSubmitting}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.halfField}>
                  <label className={styles.label}>
                    <MapPin size={18} className={styles.labelIcon} />
                    <span>General Location</span>
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    name="location"
                    placeholder="e.g. San Diego, CA"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                </div>

                <div className={styles.halfField}>
                  <label className={styles.label}>
                    <CalendarDays size={18} className={styles.labelIcon} />
                    <span>Month</span>
                    <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                  {errors.month && <p className={styles.error}>{errors.month}</p>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Eye size={18} className={styles.labelIcon} />
                  Visibility <span className={styles.required}>*</span>
                </label>

                {visibilityOptions.map((option) => (
                  <label key={option.value} className={styles.visibilityBox}>
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

                {errors.visibility && <p className={styles.error}>{errors.visibility}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Upload size={18} className={styles.labelIcon} />
                  <span>Photo</span>
                </label>

                <label htmlFor="photoUpload" className={styles.uploadBox}>
                  <div className={styles.uploadIcon}>
                    <Upload size={28} className={styles.labelIcon} />
                  </div>
                  <p className={styles.uploadTitle}>Click to upload photo</p>
                  <p className={styles.uploadText}>JPG, PNG, or WebP up to 10MB</p>
                  {photoName && <p className={styles.fileName}>{photoName}</p>}
                </label>

                <input
                  id="photoUpload"
                  className={styles.hiddenInput}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,"
                  onChange={handlePhotoChange}
                  disabled={isLoading || isSubmitting}
                />

                {errors.photo && <p className={styles.error}>{errors.photo}</p>}
              </div>

              <button className={styles.submitButton} type="submit" disabled={isLoading || isSubmitting}>
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
