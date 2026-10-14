import { Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArticleLanguage } from "@/core/articles/article";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/id";

interface LanguageBadgeProps {
  language: ArticleLanguage;
  dict: Dictionary;
  /** When given, the badge only shows if the article's language differs from the UI's. */
  hideWhenMatching?: Locale;
  className?: string;
}

/** Tells readers up front which language a story is written in. */
export function LanguageBadge({ language, dict, hideWhenMatching, className }: LanguageBadgeProps) {
  if (hideWhenMatching === language) return null;
  return (
    <Badge tone="rose" className={className}>
      <Languages className="size-3" aria-hidden />
      {dict.languages[language]}
    </Badge>
  );
}
