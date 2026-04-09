"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import styles from "@/styles/CreateEvent/CreateEventNavbar.module.css";

export default function CreateEventNavbar() {
  const router = useRouter();

  return (
    <div className={styles.topBar}>
      <Image src="/op_surf_logo_no_bg.png" alt="Operation Surf Logo" width={58} height={46} className={styles.logo} />

      <button className={styles.backButton} type="button" onClick={() => router.back()}>
        <ArrowLeft size={18} className={styles.labelIcon} />
        <span>Back</span>
      </button>
    </div>
  );
}
