import Link from "next/link";
import { AboutTrigger } from "@/components/about/about-context";
import { Container } from "@/components/ui/container";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes, SECTION_IDS } from "@/lib/routes";
import { Logo } from "./logo";

export async function Footer() {
  const { locale, dict } = await getDictionary();
  const links = [
    { href: routes.section(locale, SECTION_IDS.home), label: dict.nav.home },
    { href: routes.section(locale, SECTION_IDS.articles), label: dict.nav.articles },
    { href: routes.section(locale, SECTION_IDS.request), label: dict.nav.request },
    { href: routes.section(locale, SECTION_IDS.contact), label: dict.nav.contact },
  ];

  return (
    <footer className="bg-forest text-cream">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.5fr_1fr]">
        <div className="flex items-center gap-5">
          <Logo tone="light" className="w-24" />
          <div>
            <p className="font-display text-3xl">{siteConfig.name}</p>
            <p className="mt-1 font-hand text-xl text-rose">{dict.footer.tagline}</p>
          </div>
        </div>
        <nav aria-label={dict.footer.navigation}>
          <p className="text-xs font-extrabold tracking-[0.2em] text-cream/50 uppercase">
            {dict.footer.navigation}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-cream/80 transition-colors hover:text-rose">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <AboutTrigger className="text-cream/80 transition-colors hover:text-rose">
                {dict.nav.about}
              </AboutTrigger>
            </li>
          </ul>
        </nav>
      </Container>
      <div className="border-t border-cream/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-sm text-cream/60 sm:flex-row">
          <p>
            © {siteConfig.name}. {dict.footer.rights}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-rose">
              {siteConfig.contactEmail}
            </a>
            <a
              href={siteConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-rose"
            >
              <InstagramIcon className="size-4" />
              {siteConfig.instagram.handle}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
