"use client";

/* eslint-disable @next/next/no-img-element */
import type { SyntheticEvent } from "react";

const fallbackImage = "/operation-surf.png";

const getImageSource = (src: string) => {
  const trimmedSrc = src.trim();

  if (!trimmedSrc) {
    return fallbackImage;
  }

  if (
    trimmedSrc.startsWith("/") ||
    trimmedSrc.startsWith("http") ||
    trimmedSrc.startsWith("data:") ||
    trimmedSrc.startsWith("blob:")
  ) {
    return trimmedSrc;
  }

  return `/${trimmedSrc}`;
};

type ProgramCardImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ProgramCardImage({ src, alt, className }: ProgramCardImageProps) {
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;

    if (image.src.endsWith(fallbackImage)) {
      return;
    }

    image.src = fallbackImage;
  };

  return <img className={className} src={getImageSource(src)} alt={alt} onError={handleImageError} />;
}
