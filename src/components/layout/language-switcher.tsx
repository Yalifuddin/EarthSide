"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { LOCALE_COOKIE, LOCALES, switchLocalePath, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type Tone = "dark" | "light";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

/**
 * ID/EN toggle that keeps the reader on the same page. Reading the pathname is
 * request-time data, so until it resolves a static version links to each home page.
 */
export function LanguageSwitcher({ tone = "dark" }: { tone?: Tone }) {
  return (
    <Suspense fallback={<SwitcherView tone={tone} hrefFor={(locale) => `/${locale}`} />}>
      <PathAwareSwitcher tone={tone} />
    </Suspense>
  );
}

function PathAwareSwitcher({ tone }: { tone: Tone }) {
  const pathname = usePathname();
  return <SwitcherView tone={tone} hrefFor={(locale) => switchLocalePath(pathname, locale)} />;
}

function SwitcherView({ tone, hrefFor }: { tone: Tone; hrefFor: (locale: Locale) => string }) {
  const { locale, dict } = useI18n();

  return (
    <nav
      aria-label={dict.nav.language}
      className={cn(
        "relative flex rounded-full p-1 text-xs font-extrabold",
        tone === "dark" ? "bg-forest/10" : "bg-cream/15",
      )}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <Link
            key={option}
            href={hrefFor(option)}
            onClick={() => rememberLocale(option)}
            aria-current={active ? "true" : undefined}
            hrefLang={option}
            scroll={false}
            className={cn(
              "relative z-10 rounded-full px-3 py-1.5 uppercase transition-colors",
              active
                ? "text-cream"
                : tone === "dark"
                  ? "text-forest/70 hover:text-forest"
                  : "text-cream/70 hover:text-cream",
            )}
          >
            {active && (
              <motion.span
                layoutId="locale-pill"
                className="absolute inset-0 -z-10 rounded-full bg-forest"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {option}
          </Link>
        );
      })}
    </nav>
  );
}
