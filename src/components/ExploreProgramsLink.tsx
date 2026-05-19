"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useLinkLoading } from "@/hooks/useLinkLoading";
import style from "@/app/page.module.css";

const PROGRAMS_HREF = "/programs";

export default function ExploreProgramsLink() {
  const { isLoading, handleClick } = useLinkLoading(PROGRAMS_HREF);

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
