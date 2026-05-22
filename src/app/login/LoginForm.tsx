"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import styles from "../signup/signup.module.css";

type FormState = {
  email: string;
  password: string;
};

const initialFormState: FormState = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const result = await authClient.signIn.email({
        email: form.email,
        password: form.password,
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to sign in.");
        return;
      }

      setStatusMessage("Signed in successfully.");
      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <Image className={styles.backgroundImage} src="/hero-img.png" alt="" fill priority />
      <div className={styles.tint} />

      <section className={styles.signupPanel} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>
          Log In
        </h1>

        <Image className={styles.panelLogo} src="/op_surf_logo.png" alt="Operation Surf" width={118} height={94} />

        <form className={styles.form} onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
            />
          </label>

          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className={styles.spinner} size={16} /> : <LogIn size={16} />}
            Log in
          </button>
        </form>

        {statusMessage && (
          <p className={styles.successMessage}>
            <CheckCircle2 size={15} />
            {statusMessage}
          </p>
        )}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <p className={styles.footerText}>
          Need an account? <Link href="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
