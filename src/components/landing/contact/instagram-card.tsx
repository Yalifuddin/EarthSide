import { ArrowUpRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries/id";
import { ContactTile } from "./contact-tile";

export function InstagramCard({ dict }: { dict: Dictionary }) {
  const { handle, url } = siteConfig.instagram;
  const external = { href: url, target: "_blank", rel: "noopener noreferrer" } as const;

  return (
    <ContactTile
      icon={<InstagramIcon className="size-9" />}
      iconClassName="bg-ocean/12 text-ocean"
      label={dict.contact.instagramLabel}
      value={
        <a {...external} className="transition hover:text-leaf">
          {handle}
        </a>
      }
      hint={dict.contact.instagramHint}
    >
      <a {...external} className={buttonClasses({ size: "md", variant: "secondary" })}>
        <InstagramIcon className="size-4" />
        {dict.contact.followInstagram}
        <ArrowUpRight className="size-4" aria-hidden />
      </a>
    </ContactTile>
  );
}
