"use client";

import { Check, Copy, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button, buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/i18n/i18n-provider";
import { ContactTile } from "./contact-tile";

export function EmailCard() {
  const { dict } = useI18n();
  const { copied, copy } = useCopyToClipboard();
  const mailto = `mailto:${siteConfig.contactEmail}`;
  const [localPart, domain] = siteConfig.contactEmail.split("@");

  return (
    <ContactTile
      icon={<Mail className="size-9" aria-hidden />}
      iconClassName="bg-rose-soft text-rose-deep"
      label={dict.contact.emailLabel}
      value={
        <a href={mailto} className="transition hover:text-leaf">
          {/* Allow the line to break before "@" rather than mid-word on narrow cards. */}
          {localPart}
          <wbr />@{domain}
        </a>
      }
    >
      <a href={mailto} className={buttonClasses({ size: "md" })}>
        <Mail className="size-4" aria-hidden />
        {dict.contact.sendEmail}
      </a>
      <Button
        variant="outline"
        size="md"
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
    </ContactTile>
  );
}
