"use client";

import { useRouter } from "next/navigation";
import { Roboto_Slab } from "next/font/google";
import styles from "./CreateEventSelect.module.css";

const roboto = Roboto_Slab({
  subsets: ["latin"],
});

export default function CreateEventSelect() {
  const router = useRouter();

  return (
    <div className={roboto.className}>
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Create Event</h1>

          <button className={styles.cardButton} onClick={() => router.push("/create-event/program")}>
            Create Program
          </button>

          <button className={styles.cardButton} onClick={() => router.push("/create-event/day")}>
            Create Day
          </button>

          <button className={styles.cardButton} onClick={() => router.push("/create-event/shift")}>
            Create Shift
          </button>
        </div>
      </div>
    </div>
  );
}
