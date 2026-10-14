"use client";

import { Check, Copy, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button, buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/i18n/i18n-provider";

export function ContactCard() {
  const { dict } = useI18n();
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="group relative mx-auto max-w-2xl rounded-[2.5rem] bg-white/70 p-8 text-center shadow-[0_30px_60px_-40px_rgb(10_51_35/0.7)] ring-1 ring-forest/5 sm:p-12">
      <motion.div
        className="mx-auto grid size-20 place-items-center rounded-[1.75rem] bg-rose-soft text-rose-deep"
        whileHover={{ rotate: [0, -10, 10, -6, 0] }}
        transition={{ duration: 0.6 }}
      >
        <Mail className="size-9" aria-hidden />
      </motion.div>

      <p className="mt-6 text-xs font-extrabold tracking-[0.25em] text-ink/50 uppercase">
        {dict.contact.emailLabel}
      </p>
      <a
        href={`mailto:${siteConfig.contactEmail}`}
        className="mt-2 inline-block font-display text-2xl break-all text-forest transition hover:text-leaf sm:text-3xl"
      >
        {siteConfig.contactEmail}
      </a>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a href={`mailto:${siteConfig.contactEmail}`} className={buttonClasses({ size: "lg" })}>
          <Mail className="size-4" aria-hidden />
          {dict.contact.sendEmail}
        </a>
        <Button
          variant="outline"
          size="lg"
          onClick={() => copy(siteConfig.contactEmail)}
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "copied" : "copy"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="inline-flex items-center gap-2"
            >
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              {copied ? dict.contact.copied : dict.contact.copy}
            </motion.span>
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}
