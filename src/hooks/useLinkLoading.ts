"use client";

import type { LinkProps } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MouseEvent, useEffect, useMemo, useState } from "react";

const getHrefString = (href: LinkProps["href"]) => {
  if (typeof href === "string") {
    return href;
  }

  return typeof href.pathname === "string" ? href.pathname : null;
};

const stripHash = (href: string) => href.split("#")[0];

export function useLinkLoading(href: LinkProps["href"]) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const currentHref = useMemo(() => {
    const queryString = searchParams.toString();

    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    setIsLoading(false);
  }, [currentHref]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const linkTarget = event.currentTarget.target;

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      (linkTarget && linkTarget !== "_self") ||
      event.currentTarget.hasAttribute("download")
    ) {
      return;
    }

    const targetHref = getHrefString(href);

    if (targetHref && stripHash(targetHref) === stripHash(currentHref)) {
      return;
    }

    setIsLoading(true);
  };

  return { isLoading, handleClick };
}
