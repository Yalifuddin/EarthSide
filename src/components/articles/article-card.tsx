"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ArticleSummary } from "@/core/articles/article";
import { useI18n } from "@/i18n/i18n-provider";
import { routes } from "@/lib/routes";
import { ArticleMeta } from "./article-meta";
import { CategoryBadge } from "./category-badge";
import { CoverImage } from "./cover-image";
import { LanguageBadge } from "./language-badge";

/** Pebble-shaped card used in article grids. */
export function ArticleCard({ article }: { article: ArticleSummary }) {
  const { locale, dict } = useI18n();

  return (
    <Link
      href={routes.article(locale, article.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-white/70 p-3 shadow-[0_14px_40px_-28px_rgb(10_51_35/0.6)] ring-1 ring-forest/5 transition duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_24px_50px_-28px_rgb(10_51_35/0.7)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
        <CoverImage
          src={article.coverImageUrl}
          alt={article.coverImageAlt || article.title}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <CategoryBadge
            category={article.category}
            dict={dict}
            className="bg-cream/90 backdrop-blur"
          />
          <LanguageBadge
            language={article.language}
            dict={dict}
            hideWhenMatching={locale}
            className="bg-cream/90 backdrop-blur"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <h3 className="font-display text-xl leading-snug text-forest text-balance">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-ink/70">{article.excerpt}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <ArticleMeta article={article} locale={locale} dict={dict} className="text-xs" />
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest/8 text-forest transition group-hover:rotate-45 group-hover:bg-forest group-hover:text-cream">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
