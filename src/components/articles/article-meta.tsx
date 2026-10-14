import { Clock } from "lucide-react";
import type { ArticleSummary } from "@/core/articles/article";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/id";
import { formatDate, interpolate } from "@/i18n/format";
import { cn } from "@/lib/cn";

interface ArticleMetaProps {
  article: Pick<ArticleSummary, "publishedAt" | "readingMinutes">;
  locale: Locale;
  dict: Dictionary;
  className?: string;
}

/** "12 Oktober 2026 · 4 menit baca" */
export function ArticleMeta({ article, locale, dict, className }: ArticleMetaProps) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/60", className)}>
      {article.publishedAt && (
        <>
          <time dateTime={article.publishedAt.toISOString()}>
            {formatDate(article.publishedAt, locale)}
          </time>
          <span aria-hidden>·</span>
        </>
      )}
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" aria-hidden />
        {interpolate(dict.articles.readingTime, { minutes: article.readingMinutes })}
      </span>
    </p>
  );
}
