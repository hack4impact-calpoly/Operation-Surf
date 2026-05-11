"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Roboto_Slab } from "next/font/google";
import { BriefcaseBusiness, CircleUserRound, ClipboardCheck, Home, UserRound } from "lucide-react";
import styles from "@/components/Navbar.module.css";
import { authClient } from "@/lib/auth-client";

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
  const router = useRouter();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      setIsAccountOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

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

        <div className={styles.accountMenu} ref={accountMenuRef}>
          <button
            type="button"
            className={
              pathname === "/login" || isAccountOpen ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
            aria-expanded={isAccountOpen}
            aria-haspopup="menu"
            onClick={() => setIsAccountOpen((current) => !current)}
          >
            <CircleUserRound size={14} aria-hidden="true" />
            <span>My Account</span>
          </button>

          {isAccountOpen ? (
            <div className={styles.accountDropdown} role="menu" aria-label="My account menu">
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={handleSignOut}
                disabled={isSigningOut}
                role="menuitem"
              >
                {isSigningOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
