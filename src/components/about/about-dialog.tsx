"use client";

import { BookOpen, HeartHandshake, Lightbulb, X, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/i18n-provider";
import { routes, SECTION_IDS } from "@/lib/routes";

const PILLAR_ICONS: LucideIcon[] = [BookOpen, HeartHandshake, Lightbulb];
const PILLAR_COLORS = [
  "bg-moss/25 text-leaf",
  "bg-rose-soft text-rose-deep",
  "bg-ocean/15 text-ocean",
];

/** Grows out of the globe (bottom-centre) like a ripple. */
const RIPPLE = {
  initial: { clipPath: "circle(0% at 50% 100%)", opacity: 0.6 },
  animate: { clipPath: "circle(150% at 50% 100%)", opacity: 1 },
  exit: { clipPath: "circle(0% at 50% 100%)", opacity: 0 },
  transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] as const },
};

const stagger = (index: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.35 + index * 0.08, duration: 0.5 },
});

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, dict } = useI18n();
  const about = dict.about;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-3xl bg-grain" panelMotion={RIPPLE}>
      {({ titleId }) => (
        <div className="relative p-6 sm:p-10">
          <button
            type="button"
            onClick={onClose}
            aria-label={about.close}
            className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-forest/8 text-forest transition hover:rotate-90 hover:bg-forest hover:text-cream"
          >
            <X className="size-5" />
          </button>

          <motion.div {...stagger(0)} className="flex items-center gap-4">
            <Logo className="w-20 animate-float" />
            <div>
              <p className="font-hand text-2xl text-rose-deep">{about.eyebrow}</p>
              <h2 id={titleId} className="font-display text-3xl text-forest sm:text-4xl">
                {about.title}
              </h2>
            </div>
          </motion.div>

          <motion.p {...stagger(1)} className="mt-6 text-lg leading-relaxed text-ink/85">
            {about.intro}
          </motion.p>
          <motion.p {...stagger(2)} className="mt-3 leading-relaxed text-ink/70">
            {about.body}
          </motion.p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {about.pillars.map((pillar, index) => {
              const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
              return (
                <motion.li
                  key={pillar.title}
                  {...stagger(3 + index)}
                  className="rounded-3xl bg-white/60 p-5 shadow-[0_8px_30px_-20px_rgb(10_51_35/0.5)]"
                >
                  <span
                    className={`grid size-11 place-items-center rounded-2xl ${PILLAR_COLORS[index % PILLAR_COLORS.length]}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-3 font-display text-xl text-forest">{pillar.title}</p>
                  <p className="mt-1 text-sm text-ink/70">{pillar.body}</p>
                </motion.li>
              );
            })}
          </ul>

          <motion.div
            {...stagger(6)}
            className="mt-8 flex flex-col gap-4 rounded-3xl bg-forest p-6 text-cream sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-display text-xl">{about.founderTitle}</p>
              <p className="mt-1 text-sm text-cream/75">{about.founderBody}</p>
            </div>
            <ButtonLink
              href={routes.section(locale, SECTION_IDS.articles)}
              onClick={onClose}
              variant="secondary"
              className="shrink-0"
            >
              {about.cta}
            </ButtonLink>
          </motion.div>
        </div>
      )}
    </Dialog>
  );
}
