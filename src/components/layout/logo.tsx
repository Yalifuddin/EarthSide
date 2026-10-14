import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

interface LogoProps {
  tone?: "green" | "light";
  className?: string;
  priority?: boolean;
  /** Rendered width hint for the image optimizer. */
  sizes?: string;
}

/** The hand-drawn EarthSide mark (871×651 source). */
export function Logo({ tone = "green", className, priority, sizes = "120px" }: LogoProps) {
  return (
    <Image
      src={tone === "green" ? "/brand/logo.png" : "/brand/logo-light.png"}
      alt={siteConfig.name}
      width={871}
      height={651}
      priority={priority}
      sizes={sizes}
      className={cn("h-auto", className)}
    />
  );
}
