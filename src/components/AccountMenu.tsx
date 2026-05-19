"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "@/components/AccountMenu.module.css";

type AccountMenuProps = {
  variant?: "light" | "dark";
};

export default function AccountMenu({ variant = "dark" }: AccountMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const triggerClassName = [
    styles.trigger,
    variant === "light" ? styles.triggerLight : styles.triggerDark,
    pathname === "/login" || isAccountOpen ? styles.triggerActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.accountMenu} ref={accountMenuRef}>
      <button
        type="button"
        className={triggerClassName}
        aria-expanded={isAccountOpen}
        aria-haspopup="menu"
        onClick={() => setIsAccountOpen((current) => !current)}
      >
        <CircleUserRound size={14} aria-hidden="true" />
        <span>My Account</span>
      </button>

      {isAccountOpen ? (
        <div className={styles.accountDropdown} role="menu" aria-label="My account menu">
          <Link
            href="/volunteer-dashboard"
            className={styles.dropdownLink}
            role="menuitem"
            onClick={() => setIsAccountOpen(false)}
          >
            My Dashboard
          </Link>

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
  );
}
