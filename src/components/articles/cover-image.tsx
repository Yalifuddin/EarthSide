"use client";

import Image from "next/image";
import { useState } from "react";
import { Leaf } from "@/components/landing/floating-leaves";
import { cn } from "@/lib/cn";

interface CoverImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Local SVGs and in-browser previews can't go through the image optimizer. */
function needsUnoptimized(src: string) {
  return src.endsWith(".svg") || src.startsWith("blob:");
}

/**
 * Fills its (relatively positioned) parent. Shows a leafy placeholder when an
 * article has no cover — or when its image fails to load (e.g. it was deleted).
 */
export function CoverImage({ src, alt, sizes, priority, className }: CoverImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <CoverPlaceholder className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={needsUnoptimized(src)}
      onError={() => setFailedSrc(src)}
      className={cn("object-cover", className)}
    />
  );
}

export function CoverPlaceholder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 grid place-items-center overflow-hidden bg-gradient-to-br from-moss/40 via-cream to-rose-soft",
        className,
      )}
    >
      <Leaf size={44} className="absolute top-[18%] left-[16%] -rotate-12 text-moss/40" />
      <Leaf size={30} className="absolute right-[18%] bottom-[20%] rotate-45 text-rose/60" />
      <Leaf size={64} className="text-leaf/70" />
    </div>
  );
}
