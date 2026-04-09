"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/CreateShift.module.css";
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
import CreateEventNavbar from "./CreateEventNavbar";

const roboto = Roboto_Slab({
  subsets: ["latin"],
});

const visibilityOptions = [
  {
    value: "listed",
    title: "Listed",
    text: "(Public access)",
  },
  {
    value: "unlisted",
    title: "Unlisted",
    text: "(Link only)",
  },
  {
    value: "private",
    title: "Private",
    text: "(Invite only)",
  },
];

export default function CreateShift() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    shiftName: "",
    description: "",
    exactLocation: "",
    shiftDate: "",
    startTime: "",
    endTime: "",
    visibility: "",
    spots: "",
    parentEvent: "",
  });

  const [errors, setErrors] = useState({
    shiftName: "",
    shiftDate: "",
    startTime: "",
    endTime: "",
    visibility: "",
    spots: "",
    parentEvent: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear errors & input validation once required fields are filled
    if (name === "shiftName" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, shiftName: "" }));
    }

    if (name === "shiftDate" && value !== "") {
      setErrors((prev) => ({ ...prev, shiftDate: "" }));
    }

    if (name === "startTime" && value !== "") {
      setErrors((prev) => ({ ...prev, startTime: "" }));
    }

    if (name === "endTime" && value !== "") {
      setErrors((prev) => ({ ...prev, endTime: "" }));
    }

    if (name === "visibility" && value !== "") {
      setErrors((prev) => ({ ...prev, visibility: "" }));
    }

    if (name === "spots" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, spots: "" }));
    }

    if (name === "parentEvent" && value.trim() !== "") {
      setErrors((prev) => ({ ...prev, parentEvent: "" }));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    const hasError = Object.values(newErrors).some((value) => value !== "");

    if (hasError) return;

    console.log("submitted shift form");
    alert("Shift successfully submitted!");
  }

  return (
    <div className={roboto.className}>
      <div className={styles.page}>
        <CreateEventNavbar />

        <div className={styles.content}>
          <div className={styles.pageIntro}>
            <h1 className={styles.pageTitle}>Create Shift</h1>
            <p className={styles.pageSubtitle}>Set up volunteer opportunities for your event</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* section: basic information */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <ClipboardListIcon size={20} className={styles.labelIcon} />
                </div>
                <h2 className={styles.sectionTitle}>Basic Information</h2>
              </div>

              <div className={styles.sectionBody}>
                {/* field: shift name */}
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
                  />
                  {errors.shiftName && <p className={styles.error}>{errors.shiftName}</p>}
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
                    placeholder="Describe the shift responsibilities and expectations..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* section: location & timing */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <MapPlus size={20} className={styles.labelIcon} />
                </div>
                <h2 className={styles.sectionTitle}>Location & Timing</h2>
              </div>

              {/* field: exact location */}
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
                  />
                </div>

                {/* field: day + exact time */}
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
                      />
                      {errors.endTime && <p className={styles.error}>{errors.endTime}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* section: settings & details */}
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

                  {/* field: visibility */}
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

                {/* field: # of spots */}
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
                    />
                    {errors.spots && <p className={styles.error}>{errors.spots}</p>}
                  </div>

                  {/* field: parent event */}
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
                      placeholder="e.g. Morning Surf Session"
                      value={formData.parentEvent}
                      onChange={handleChange}
                    />
                    {errors.parentEvent && <p className={styles.error}>{errors.parentEvent}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button className={styles.submitButton} type="submit">
              Create Shift
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
