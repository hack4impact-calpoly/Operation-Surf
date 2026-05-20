"use client";

import Image from "next/image";
import { Home, Calendar, Bell, User } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";
import styles from "@/styles/Navbar.module.css";

const inter = Inter({
  subsets: ["latin"],
});

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/">
        <Image
          src="/op_surf_logo_no_bg.png"
          alt="Operation Surf Logo"
          width={58}
          height={46}
          className={styles.logoImg}
        />
      </Link>

      <div className={styles.navLinks}>
        <Link href="/" className={styles.navLink}>
          <span className={styles.navIcon}>
            <Home size={21} aria-hidden="true" />
          </span>
          Home
        </Link>

        <Link href="/programs" className={styles.navLink}>
          <span className={styles.navIcon}>
            <Calendar size={21} aria-hidden="true" />
          </span>
          Programs
        </Link>

        <Link href="/notifications" className={styles.navLink}>
          <span className={styles.navIcon}>
            <Bell size={21} aria-hidden="true" />
          </span>
          Notifications
        </Link>

        <Link href="/account" className={styles.navLink}>
          <span className={styles.navIcon}>
            <User size={21} aria-hidden="true" />
          </span>
          My Account
        </Link>
      </div>
    </nav>
  );
}
