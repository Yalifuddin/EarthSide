import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap " +
  "transition-[transform,background-color,color,box-shadow] duration-200 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-cream shadow-[0_8px_24px_-12px_rgb(10_51_35/0.7)] hover:-translate-y-0.5 hover:bg-leaf",
  secondary: "bg-rose text-forest hover:-translate-y-0.5 hover:bg-rose-deep hover:text-cream",
  outline: "border-2 border-forest/80 text-forest hover:bg-forest hover:text-cream",
  ghost: "text-forest hover:bg-forest/10",
  danger: "bg-rose-deep text-cream hover:bg-[#8d4f46]",
  light: "bg-cream text-forest hover:-translate-y-0.5 hover:bg-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Omit<StyleProps, "children">) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
