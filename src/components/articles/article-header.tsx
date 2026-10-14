import type { ReactNode } from "react";
import type { ArticleSummary } from "@/core/articles/article";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/id";
import { interpolate } from "@/i18n/format";
import { ArticleMeta } from "./article-meta";
import { CategoryBadge } from "./category-badge";
import { CoverImage } from "./cover-image";
import { LanguageBadge } from "./language-badge";

type HeaderArticle = Pick<
  ArticleSummary,
  "title" | "category" | "language" | "authorName" | "publishedAt" | "readingMinutes"
>;

interface ArticleHeaderProps {
  article: HeaderArticle;
  locale: Locale;
  dict: Dictionary;
  /** Optional controls on the right, e.g. a share button. */
  actions?: ReactNode;
}

/**
 * Title block of an article. Shared by the public page and the dashboard's
 * preview, so the preview always matches what readers will see.
 */
export function ArticleHeader({ article, locale, dict, actions }: ArticleHeaderProps) {
  return (
    <header>
      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={article.category} dict={dict} />
        <LanguageBadge language={article.language} dict={dict} />
      </div>
      <h1 className="mt-4 font-display text-4xl leading-tight text-forest text-balance sm:text-5xl">
        {article.title}
      </h1>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-hand text-xl text-rose-deep">
            {interpolate(dict.articles.by, { author: article.authorName })}
          </p>
          <ArticleMeta article={article} locale={locale} dict={dict} />
        </div>
        {actions}
      </div>
    </header>
  );
}

export function ArticleCover({
  src,
  alt,
  priority,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-t-[10rem] rounded-b-[2.5rem] bg-moss/20 shadow-[0_30px_60px_-40px_rgb(10_51_35/0.8)] sm:rounded-t-[16rem]">
      <CoverImage
        src={src}
        alt={alt}
        sizes="(min-width: 1024px) 1024px, 100vw"
        priority={priority}
      />
    </div>
  );
}
