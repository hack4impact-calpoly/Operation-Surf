"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Bell, CalendarDays, CheckCircle2, Home, Loader2, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import styles from "./signup.module.css";

type FormState = {
  name: string;
  username: string;
  email: string;
  password: string;
};

const initialFormState: FormState = {
  name: "",
  username: "",
  email: "",
  password: "",
};

export default function SignupForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const loadIpAddress = async () => {
    const response = await fetch("/api/ip", { cache: "no-store" });
    const data = (await response.json()) as { ip?: string };
    setIpAddress(data.ip ?? "Unavailable");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await loadIpAddress();

      const result = await authClient.signUp.email({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to create your account.");
        return;
      }

      setStatusMessage("Account created. You can sign in with these credentials.");
      setForm(initialFormState);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <Image className={styles.backgroundImage} src="/hero-img.png" alt="" fill priority />
      <div className={styles.tint} />

      <header className={styles.navbar}>
        <Link className={styles.logoLink} href="/" aria-label="Operation Surf home">
          <Image src="/operation-surf.png" alt="Operation Surf" width={78} height={62} />
        </Link>

        <nav className={styles.navLinks} aria-label="Primary navigation">
          <Link href="/" className={styles.navLink}>
            <Home size={15} />
            Home
          </Link>
          <Link href="/#programs" className={styles.navLink}>
            <CalendarDays size={15} />
            Programs
          </Link>
        </nav>
      </header>

      <section className={styles.signupPanel} aria-labelledby="signup-title">
        <h1 id="signup-title" className={styles.title}>
          Create Account
        </h1>

        <Image className={styles.panelLogo} src="/operation-surf.png" alt="Operation Surf" width={118} height={94} />

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.fieldLabel}>
            <span>Name</span>
            <input
              className={styles.input}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            <span>Username</span>
            <input
              className={styles.input}
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            <span>Email</span>
            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            <span>Password</span>
            <input
              className={styles.input}
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className={styles.spinner} size={16} /> : <UserPlus size={16} />}
            Sign up
          </button>
        </form>

        {ipAddress && <p className={styles.ipNotice}>IP: {ipAddress}</p>}
        {statusMessage && (
          <p className={styles.successMessage}>
            <CheckCircle2 size={15} />
            {statusMessage}
          </p>
        )}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <p className={styles.footerText}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
