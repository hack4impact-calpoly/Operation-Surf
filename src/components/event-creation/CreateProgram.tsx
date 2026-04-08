"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/CreateProgram.module.css";
import { ArrowLeft, ClipboardList, MapPin, CalendarDays, Eye, Upload, FileText } from "lucide-react";

// array used later to display visibility options
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

export default function CreateProgram() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    programName: "",
    description: "",
    location: "",
    month: "",
    visibility: "",
  });

  const [photoName, setPhotoName] = useState("");

  // state for error checking & input validation
  const [errors, setErrors] = useState({
    programName: "",
    month: "",
    visibility: "",
    photo: "",
  });

  // unused for now:
  // const isFormValid =
  //   formData.programName.trim() !== "" &&
  //   formData.month !== "" &&
  //   formData.visibility !== "" &&
  //   !errors.programName &&
  //   !errors.month &&
  //   !errors.visibility &&
  //   !errors.photo;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear errors & input validation once required fields are filled
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = {
      programName: formData.programName.trim() === "" ? "Program name is required" : "",
      month: formData.month === "" ? "Month must be selected" : "",
      visibility: formData.visibility === "" ? "Visibility must be selected" : "",
      photo: errors.photo,
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((value) => value !== "");

    if (hasError) return;

    console.log("submitted program form");
    alert("Form successfully submitted!");
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Image src="/op_surf_logo_no_bg.png" alt="Operation Surf Logo" width={58} height={46} className={styles.logo} />

        <button className={styles.backButton} type="button" onClick={() => router.back()}>
          <ArrowLeft size={18} className={styles.labelIcon} />
          <span>Back</span>
        </button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div className={styles.titleRow}>
              <div className={styles.titleIcon}>
                <ClipboardList size={18} className={styles.labelIcon} />
              </div>

              <div>
                <h1 className={styles.title}>Create Program</h1>
                <p className={styles.subtitle}>Set up a new program to organize events and opportunities</p>
              </div>
            </div>
          </div>

          {/* field: program Name */}
          <div className={styles.cardBody}>
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
              />
              {errors.programName && <p className={styles.error}>{errors.programName}</p>}
            </div>

            {/* field: description */}
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
              />
            </div>

            {/* field: general location */}
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
                />
              </div>

              {/* field: month */}
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
                />
                {errors.month && <p className={styles.error}>{errors.month}</p>}
              </div>
            </div>

            {/* field: visibility */}
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
                  />
                  <div>
                    <p className={styles.visibilityTitle}>{option.title}</p>
                    <p className={styles.visibilityText}>{option.text}</p>
                  </div>
                </label>
              ))}

              {errors.visibility && <p className={styles.error}>{errors.visibility}</p>}
            </div>

            {/* field: upload photo */}
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
                <p className={styles.uploadText}>JPG, PNG or WebP up to 10MB</p>
                {photoName && <p className={styles.fileName}>{photoName}</p>}
              </label>

              <input
                id="photoUpload"
                className={styles.hiddenInput}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,"
                onChange={handlePhotoChange}
              />

              {errors.photo && <p className={styles.error}>{errors.photo}</p>}
            </div>

            <button className={styles.submitButton} type="submit">
              Create Program
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
