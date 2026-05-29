"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Home,
  Users,
  type LucideIcon,
  LogIn,
  UserPlus,
  // UserRound,
} from "lucide-react";
import AccountMenu from "@/components/AccountMenu";
import styles from "@/components/Navbar.module.css";

type NavbarProps = {
  name?: string | null;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  activePaths?: string[];
};

const adminNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  {
    href: "/programs",
    label: "Programs",
    icon: CalendarDays,
    activePaths: ["/programs", "/program-details", "/day-details"],
  },
  {
    href: "/opportunities",
    label: "Opportunities",
    icon: BriefcaseBusiness,
    activePaths: ["/opportunities", "/create-event"],
  },
  {
    href: "/admin/volunteers",
    label: "Volunteers",
    icon: Users,
    activePaths: ["/admin/volunteers", "/admin/users"],
  },
  // { href: "/signup", label: "Memberships", icon: UserRound },
  { href: "/shift", label: "Check In", icon: ClipboardCheck, activePaths: ["/shift", "/checkin"] },
];

const publicNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  {
    href: "/programs",
    label: "Programs",
    icon: CalendarDays,
    activePaths: ["/programs", "/program-details", "/day-details"],
  },
];

function isActivePath(pathname: string, item: NavItem) {
  const activePaths = item.activePaths ?? [item.href];

  return activePaths.some((activePath) => {
    if (activePath === "/") {
      return pathname === "/";
    }

    return pathname === activePath || pathname.startsWith(`${activePath}/`);
  });
}

export default function Navbar({ name, isAuthenticated = false, isAdmin = false }: NavbarProps) {
  const pathname = usePathname();
  const navItems = isAdmin ? adminNavItems : publicNavItems;

  return (
    <nav className={styles.navbar} aria-label="Primary navigation">
      <Link className={styles.logoLink} href="/" aria-label="Operation Surf home">
        <Image src="/op_surf_logo_no_bg.png" alt="Operation Surf" width={180} height={70} priority />
      </Link>

      <div className={styles.navGroup}>
        {name ? <span className={styles.navGreeting}>Hi, {name}</span> : null}

        {navItems.map((item) => {
          const { href, label, icon: Icon } = item;
          const isActive = isActivePath(pathname, item);

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

        {isAuthenticated ? (
          <AccountMenu isAdmin={isAdmin} />
        ) : (
          <div className={styles.authLinks}>
            <Link
              href="/login"
              className={pathname === "/login" ? `${styles.authLink} ${styles.navLinkActive}` : styles.authLink}
              aria-current={pathname === "/login" ? "page" : undefined}
            >
              <LogIn size={14} aria-hidden="true" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/signup"
              className={
                pathname === "/signup" ? `${styles.authLink} ${styles.authLinkPrimary}` : styles.authLinkPrimary
              }
              aria-current={pathname === "/signup" ? "page" : undefined}
            >
              <UserPlus size={14} aria-hidden="true" />
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
