export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** BCP-47 tags used for Intl formatting. */
export const INTL_LOCALE: Record<Locale, string> = {
  id: "id-ID",
  en: "en-GB",
};

/** Swaps the locale segment of a pathname, e.g. `/id/articles` → `/en/articles`. */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}
