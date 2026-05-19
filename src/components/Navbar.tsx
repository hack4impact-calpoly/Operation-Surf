"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Roboto_Slab } from "next/font/google";
import { BriefcaseBusiness, ClipboardCheck, Home, UserRound } from "lucide-react";
import AccountMenu from "@/components/AccountMenu";
import styles from "@/components/Navbar.module.css";

type NavbarProps = {
  name?: string | null;
};

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
});

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { href: "/signup", label: "Memberships", icon: UserRound },
  { href: "/shift", label: "Check In", icon: ClipboardCheck },
];

export default function Navbar({ name }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className={`${styles.navbar} ${robotoSlab.className}`} aria-label="Primary navigation">
      <Link className={styles.logoLink} href="/" aria-label="Operation Surf home">
        <Image src="/operation-surf.png" alt="Operation Surf" width={86} height={34} priority />
      </Link>

      <div className={styles.navGroup}>
        {name ? <span className={styles.navGreeting}>Hi, {name}</span> : null}

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={14} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}

        <AccountMenu />
      </div>
    </nav>
  );
}
