"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./volunteer-application.module.css";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  birthday: string;
  sex: string;
  height: string;
  weight: string;
  shirtSize: string;
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyRelationship: string;
  emergencyEmail: string;
  emergencyPhone: string;
  liabilityWaiverAccepted: string;
};

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipcode: "",
  birthday: "",
  sex: "",
  height: "",
  weight: "",
  shirtSize: "",
  emergencyFirstName: "",
  emergencyLastName: "",
  emergencyRelationship: "",
  emergencyEmail: "",
  emergencyPhone: "",
  liabilityWaiverAccepted: "yes",
};

export default function VolunteerApplicationForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadApplication() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/volunteer/application", { cache: "no-store" });
        const data = (await response.json()) as {
          application?: Partial<FormState> & { liabilityWaiverAccepted?: boolean };
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message ?? "Failed to load volunteer application.");
        }

        if (data.application) {
          setForm({
            ...emptyForm,
            ...data.application,
            liabilityWaiverAccepted: data.application.liabilityWaiverAccepted ? "yes" : "no",
          });
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load volunteer application.");
      } finally {
        setIsLoading(false);
      }
    }

    loadApplication();
  }, []);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/volunteer/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          liabilityWaiverAccepted: form.liabilityWaiverAccepted === "yes",
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to save volunteer application.");
      }

      setStatusMessage("Volunteer application saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save volunteer application.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.panel}>
          <h1 className={styles.title}>Volunteer Application</h1>

          {isLoading ? <p className={styles.infoMessage}>Loading application...</p> : null}
          {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
          {statusMessage ? <p className={styles.successMessage}>{statusMessage}</p> : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <input
                className={styles.input}
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                required
              />
              <input
                className={styles.input}
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                required
              />
              <input
                className={`${styles.input} ${styles.spanTwo}`}
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />

              <input
                className={`${styles.input} ${styles.spanTwo}`}
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
              <input
                className={`${styles.input} ${styles.spanTwo}`}
                placeholder="Address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
              />

              <input
                className={styles.input}
                placeholder="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
              <input
                className={styles.input}
                placeholder="State"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                required
              />
              <input
                className={styles.input}
                placeholder="Zipcode"
                value={form.zipcode}
                onChange={(e) => updateField("zipcode", e.target.value)}
                required
              />
              <input
                className={styles.input}
                type="date"
                placeholder="Birthday"
                value={form.birthday}
                onChange={(e) => updateField("birthday", e.target.value)}
                required
              />

              <select
                className={styles.input}
                value={form.sex}
                onChange={(e) => updateField("sex", e.target.value)}
                required
              >
                <option value="">Sex</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="intersex">Intersex</option>
                <option value="prefer_not_to_say">Prefer Not To Say</option>
                <option value="other">Other</option>
              </select>

              <input
                className={styles.input}
                type="number"
                min="1"
                placeholder="Height"
                value={form.height}
                onChange={(e) => updateField("height", e.target.value)}
                required
              />
              <input
                className={styles.input}
                type="number"
                min="1"
                placeholder="Weight"
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                required
              />
              <select
                className={styles.input}
                value={form.shirtSize}
                onChange={(e) => updateField("shirtSize", e.target.value)}
                required
              >
                <option value="">Shirt Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="2XL">2XL</option>
                <option value="3XL">3XL</option>
              </select>
            </div>

            <div className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>Emergency Contact Information</h2>

              <div className={styles.grid}>
                <input
                  className={styles.input}
                  placeholder="First Name"
                  value={form.emergencyFirstName}
                  onChange={(e) => updateField("emergencyFirstName", e.target.value)}
                  required
                />
                <input
                  className={styles.input}
                  placeholder="Last Name"
                  value={form.emergencyLastName}
                  onChange={(e) => updateField("emergencyLastName", e.target.value)}
                  required
                />
                <input
                  className={styles.input}
                  placeholder="Relationship"
                  value={form.emergencyRelationship}
                  onChange={(e) => updateField("emergencyRelationship", e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Email"
                  type="email"
                  value={form.emergencyEmail}
                  onChange={(e) => updateField("emergencyEmail", e.target.value)}
                  required
                />

                <input
                  className={`${styles.input} ${styles.spanTwo}`}
                  placeholder="Phone Number"
                  value={form.emergencyPhone}
                  onChange={(e) => updateField("emergencyPhone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.footerRow}>
              <div className={styles.waiverBlock}>
                <span className={styles.waiverLabel}>Liability Form Document</span>
                <a
                  className={styles.waiverLink}
                  href="mailto:info@operationsurf.org?subject=Operation%20Surf%20Liability%20Form"
                >
                  Link
                </a>
              </div>

              <label className={styles.waiverSelectBlock}>
                <span className={styles.waiverLabel}>Filled Out</span>
                <select
                  className={styles.waiverSelect}
                  value={form.liabilityWaiverAccepted}
                  onChange={(e) => updateField("liabilityWaiverAccepted", e.target.value)}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>

            <button className={styles.submitButton} type="submit" disabled={isSaving || isLoading}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
