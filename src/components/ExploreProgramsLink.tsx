"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import style from "@/app/page.module.css";

const PROGRAMS_HREF = "/programs";

export default function ExploreProgramsLink() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      pathname === PROGRAMS_HREF
    ) {
      return;
    }

    setIsLoading(true);
  };

  return (
    <Link
      className={`${style.exploreButton} ${isLoading ? style.exploreButtonLoading : ""}`}
      href={PROGRAMS_HREF}
      onClick={handleClick}
      aria-busy={isLoading}
      aria-live="polite"
    >
      {isLoading ? <Loader2 className={style.exploreSpinner} size={18} aria-hidden="true" /> : null}
      <span>{isLoading ? "Loading Programs" : "Explore Programs"}</span>
    </Link>
  );
}
