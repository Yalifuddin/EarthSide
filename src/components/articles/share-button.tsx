"use client";

import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useI18n } from "@/i18n/i18n-provider";

/** Native share sheet on phones, copy-link fallback elsewhere. */
export function ShareButton({ title }: { title: string }) {
  const { dict } = useI18n();
  const { copied, copy } = useCopyToClipboard();

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Cancelled or unsupported — fall back to copying.
      }
    }
    await copy(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={share} aria-live="polite">
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Share2 className="size-4" aria-hidden />
      )}
      {copied ? dict.articles.linkCopied : dict.articles.share}
    </Button>
  );
}
