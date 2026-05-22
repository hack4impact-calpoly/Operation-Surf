"use client";

/* eslint-disable @next/next/no-img-element */
import type { SyntheticEvent } from "react";

const fallbackImage = "/op_surf_logo_no_bg.png";

const getImageSource = (src?: string | null) => {
  if (typeof src !== "string") {
    return fallbackImage;
  }

  const trimmedSrc = src.trim();

  if (!trimmedSrc) {
    return fallbackImage;
  }

  const normalizedSrc = trimmedSrc.replaceAll("\\", "/");

  if (
    normalizedSrc.startsWith("/") ||
    normalizedSrc.startsWith("http://") ||
    normalizedSrc.startsWith("https://") ||
    normalizedSrc.startsWith("data:") ||
    normalizedSrc.startsWith("blob:")
  ) {
    return normalizedSrc;
  }

  return `/${normalizedSrc}`;
};

type ProgramCardImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function ProgramCardImage({ src, alt, className }: ProgramCardImageProps) {
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;

    if (image.src.endsWith(fallbackImage)) {
      return;
    }

    image.onerror = null;
    image.src = fallbackImage;
  };

  return <img className={className} src={getImageSource(src)} alt={alt} onError={handleImageError} />;
}
