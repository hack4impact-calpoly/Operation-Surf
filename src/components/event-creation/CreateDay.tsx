"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/CreateDay.module.css";
import { ArrowLeft, ClipboardList, MapPin, CalendarDays, Eye, Upload, FileText, Camera } from "lucide-react";
import { Roboto_Slab } from "next/font/google";
import CreateEventNavbar from "./CreateEventNavbar";

const roboto = Roboto_Slab({
  subsets: ["latin"],
});

// array used later to display visibility options
const visibilityOptions = [
  {
    value: "listed",
    title: "Listed",
    text: "(Public)",
  },
  {
    value: "unlisted",
    title: "Unlisted",
    text: "(Link Only)",
  },
  {
    value: "private",
    title: "Private",
    text: "(Invite Only)",
  },
];

export default function CreateDay() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    location: "",
    weekDay: "",
    parentProgram: "",
    visibility: "",
  });

  const [photoName, setPhotoName] = useState("");

  const [errors, setErrors] = useState({
    eventName: "",
    weekDay: "",
    parentProgram: "",
    visibility: "",
    photo: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear errors & input validation once required fields are filled
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

  // helper function to format selected date into readable label
  function formatWeekDayLabel(dateString: string) {
    if (!dateString) return "";

    const date = new Date(dateString + "T00:00:00");

    const weekday = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const monthDayYear = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const dayOfMonth = date.getDate();
    const weekOfMonth = Math.ceil(dayOfMonth / 7);

    return `${weekday}, Week ${weekOfMonth} of ${monthDayYear}`;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = {
      eventName: formData.eventName.trim() === "" ? "Event name is required" : "",
      weekDay: formData.weekDay.trim() === "" ? "Week / Day must be selected" : "",
      parentProgram: formData.parentProgram.trim() === "" ? "Parent program is required" : "",
      visibility: formData.visibility === "" ? "Visibility must be selected" : "",
      photo: errors.photo,
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((value) => value !== "");

    if (hasError) return;

    console.log("submitted event form");
    alert("Day successfully submitted!");
  }

  return (
    <div className={roboto.className}>
      <div className={styles.page}>
        <CreateEventNavbar />

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <div className={styles.pageIntro}>
              <h1 className={styles.pageTitle}>Create Day</h1>
              <p className={styles.pageSubtitle}>Add a new event to your program</p>
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
              />

              {errors.photo && <p className={styles.error}>{errors.photo}</p>}

              <p className={styles.photoHint}>A compelling image helps attract participants</p>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <form className={styles.card} onSubmit={handleSubmit}>
              <div className={styles.cardTopBar}></div>

              {/* field: event name */}
              <div className={styles.cardBody}>
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
                  />
                  {errors.eventName && <p className={styles.error}>{errors.eventName}</p>}
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
                    placeholder="Describe what participants can expect from this event..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* field: location */}
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
                    />
                  </div>

                  {/* field: week/day */}
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
                      placeholder="e.g. Monday, Week 1"
                      value={formData.weekDay}
                      onChange={handleChange}
                    />

                    {formData.weekDay && <p className={styles.helperText}>({formatWeekDayLabel(formData.weekDay)})</p>}

                    {errors.weekDay && <p className={styles.error}>{errors.weekDay}</p>}
                  </div>
                </div>

                {/* field: parent program */}
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
                    placeholder="e.g. Adaptive Surf Therapy"
                    value={formData.parentProgram}
                    onChange={handleChange}
                  />
                  {errors.parentProgram && <p className={styles.error}>{errors.parentProgram}</p>}
                </div>

                {/* field: visibility */}
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

                <button className={styles.submitButton} type="submit">
                  Create Day
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
