"use client";

import { Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import { routes, SECTION_IDS } from "@/lib/routes";
import { AboutTrigger } from "@/components/landing/about-context";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

export function Navbar() {
  const { locale, dict } = useI18n();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(current > 24);
    // Tuck the bar away while reading downwards, bring it back on scroll up.
    setHidden(current > previous && current > 400);
  });

  const links = [
    { href: routes.section(locale, SECTION_IDS.home), label: dict.nav.home },
    { href: routes.section(locale, SECTION_IDS.articles), label: dict.nav.articles },
    { href: routes.section(locale, SECTION_IDS.request), label: dict.nav.request },
    { href: routes.section(locale, SECTION_IDS.contact), label: dict.nav.contact },
  ];

  return (
    <motion.header
      animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3"
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pr-2 pl-4 transition-all duration-300",
          scrolled || menuOpen
            ? "bg-cream/85 shadow-[0_10px_30px_-18px_rgb(10_51_35/0.5)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <Link
          href={routes.home(locale)}
          className="flex items-center gap-2"
          aria-label={siteConfig.name}
        >
          <Logo className="w-11" priority />
          <span className="font-display text-xl text-forest">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-bold text-forest/80 transition-colors hover:bg-forest/8 hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
          <AboutTrigger className="rounded-full px-4 py-2 text-sm font-bold text-forest/80 transition-colors hover:bg-forest/8 hover:text-forest">
            {dict.nav.about}
          </AboutTrigger>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={routes.search(locale)}
            aria-label={dict.nav.search}
            title={dict.nav.search}
            className="grid size-10 place-items-center rounded-full text-forest transition-colors hover:bg-forest/10"
          >
            <Search className="size-5" aria-hidden />
          </Link>
          <LanguageSwitcher />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-forest hover:bg-forest/10 md:hidden"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="mx-auto mt-2 flex max-w-6xl flex-col rounded-3xl bg-cream/95 p-3 shadow-lg backdrop-blur-md md:hidden"
          >
            {links.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * index }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 font-bold text-forest hover:bg-forest/8"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <AboutTrigger
              onOpen={() => setMenuOpen(false)}
              className="block w-full rounded-2xl px-4 py-3 text-left font-bold text-forest hover:bg-forest/8"
            >
              {dict.nav.about}
            </AboutTrigger>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
