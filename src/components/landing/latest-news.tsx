"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArticleMeta } from "@/components/articles/article-meta";
import { CategoryBadge } from "@/components/articles/category-badge";
import { CoverImage } from "@/components/articles/cover-image";
import { LanguageBadge } from "@/components/articles/language-badge";
import { ButtonLink } from "@/components/ui/button";
import type { ArticleSummary } from "@/core/articles/article";
import { useI18n } from "@/i18n/i18n-provider";
import { routes } from "@/lib/routes";

const rise = (index: number) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] as const },
});

/** Section 1 preview: the newest story big, the next two as arch cards. */
export function LatestNews({ articles }: { articles: ArticleSummary[] }) {
  const { dict } = useI18n();
  const [featured, ...others] = articles;

  if (!featured) {
    return (
      <p className="rounded-[2rem] bg-white/60 p-10 text-center font-hand text-2xl text-forest">
        {dict.hero.noArticles}
      </p>
    );
  }

  return (
    <div>
      <motion.p
        {...rise(0)}
        className="mb-5 flex items-center gap-3 font-hand text-2xl text-rose-deep"
      >
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-rose-deep" />
        </span>
        {dict.hero.latestLabel}
      </motion.p>

      <motion.div {...rise(0)}>
        <FeaturedStory article={featured} />
      </motion.div>

      {others.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {others.map((article, index) => (
            <motion.div key={article.id} {...rise(index + 1)}>
              <ArchStory article={article} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedStory({ article }: { article: ArticleSummary }) {
  const { locale, dict } = useI18n();
  return (
    <article className="group grid overflow-hidden rounded-[2.5rem] bg-white/75 p-3 shadow-[0_24px_60px_-36px_rgb(10_51_35/0.7)] ring-1 ring-forest/5 md:grid-cols-[1.1fr_1fr]">
      <Link
        href={routes.article(locale, article.slug)}
        className="relative block aspect-[16/11] overflow-hidden rounded-[2rem]"
        tabIndex={-1}
      >
        <CoverImage
          src={article.coverImageUrl}
          alt={article.coverImageAlt || article.title}
          sizes="(min-width: 768px) 560px, 100vw"
          priority
          className="transition duration-700 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-col justify-center p-5 md:p-8">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={article.category} dict={dict} />
          <LanguageBadge language={article.language} dict={dict} hideWhenMatching={locale} />
        </div>
        <h2 className="mt-4 font-display text-3xl leading-tight text-forest text-balance sm:text-4xl">
          <Link href={routes.article(locale, article.slug)} className="hover:text-leaf">
            {article.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-4 text-lg text-ink/75">{article.excerpt}</p>
        <ArticleMeta article={article} locale={locale} dict={dict} className="mt-4" />
        <ButtonLink href={routes.article(locale, article.slug)} className="mt-6 self-start">
          {dict.hero.readMore}
          <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
        </ButtonLink>
      </div>
    </article>
  );
}

function ArchStory({ article }: { article: ArticleSummary }) {
  const { locale, dict } = useI18n();
  return (
    <Link
      href={routes.article(locale, article.slug)}
      className="group flex h-full items-stretch gap-4 rounded-[2rem] bg-white/60 p-3 ring-1 ring-forest/5 transition hover:-translate-y-1 hover:bg-white"
    >
      {/* Arch-shaped window, like the sketch */}
      <div className="relative w-2/5 shrink-0 overflow-hidden rounded-t-full rounded-b-[1.25rem]">
        <CoverImage
          src={article.coverImageUrl}
          alt={article.coverImageAlt || article.title}
          sizes="200px"
          className="transition duration-700 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-col py-2 pr-2">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={article.category} dict={dict} />
          <LanguageBadge language={article.language} dict={dict} hideWhenMatching={locale} />
        </div>
        <h3 className="mt-3 font-display text-lg leading-snug text-forest text-balance">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink/70">{article.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-leaf">
          {dict.hero.readMore}
          <ArrowRight className="size-3.5 transition group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
