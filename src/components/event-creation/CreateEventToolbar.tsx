"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "@/styles/CreateEvent/CreateEventToolbar.module.css";

export default function CreateEventToolbar() {
  const router = useRouter();

  return (
    <div className={styles.topBar} aria-label="Create event actions">
      <button className={styles.backButton} type="button" onClick={() => router.back()}>
        <ArrowLeft size={18} className={styles.labelIcon} />
        <span>Back</span>
      </button>
    </div>
  );
}
