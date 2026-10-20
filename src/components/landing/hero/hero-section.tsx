import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { SECTION_IDS } from "@/lib/routes";
import { getLatestArticles } from "@/server/article-queries";
import { AnimatedTitle } from "./animated-title";
import { FloatingLeaves } from "./floating-leaves";
import { HeroLogo } from "./hero-logo";
import { InteractiveEarth } from "./interactive-earth";
import { LatestNews } from "./latest-news";

const LATEST_COUNT = 3;

/** Section 1 — title, the clickable half earth, and the newest stories. */
export async function HeroSection() {
  const { locale, dict } = await getDictionary();
  const latest = await getLatestArticles(LATEST_COUNT, locale);

  return (
    <section id={SECTION_IDS.home} className="relative overflow-hidden pt-28 sm:pt-32">
      <BackgroundBlobs />
      <FloatingLeaves />

      <Container className="relative z-10 text-center">
        <HeroLogo />
        <Reveal offset={12} delay={0.1} className="mt-2">
          <p className="font-hand text-2xl text-rose-deep sm:text-3xl">{dict.hero.eyebrow}</p>
        </Reveal>
        <AnimatedTitle
          text={siteConfig.name}
          className="font-display text-[clamp(3.75rem,13vw,8.5rem)] leading-[0.95] tracking-tight text-forest"
        />
        <Reveal delay={0.6} offset={16}>
          <p className="mt-4 font-display text-xl text-leaf sm:text-2xl">{dict.hero.tagline}</p>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">{dict.hero.description}</p>
        </Reveal>
      </Container>

      <div className="relative z-10 mt-10 sm:mt-14">
        <InteractiveEarth />
      </div>

      {/* The "ground" the globe rests on; the faint lower orbit continues the sketch's circle. */}
      <div className="relative bg-cream bg-grain pt-12 pb-20 sm:pt-16">
        <LowerOrbit />
        <Container className="relative z-10">
          <LatestNews articles={latest} />
        </Container>
      </div>
    </section>
  );
}

function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-rose/30 blur-3xl animate-float-slow" />
      <div className="absolute top-40 -right-32 size-[28rem] rounded-full bg-moss/25 blur-3xl animate-float-slow [animation-delay:-4s]" />
      <div className="absolute top-[28rem] left-1/3 size-72 rounded-full bg-ocean/10 blur-3xl" />
    </div>
  );
}

function LowerOrbit() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-5xl px-2"
    >
      <svg viewBox="0 0 1000 520" className="w-full">
        <path
          d="M20 0 A480 480 0 0 0 980 0"
          fill="none"
          className="stroke-moss/40"
          strokeWidth={3}
          strokeDasharray="10 14"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
