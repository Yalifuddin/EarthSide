"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Leaf } from "@/components/ui/leaf";
import { Spinner } from "@/components/ui/spinner";
import type { ArticleSummary } from "@/core/articles/article";
import type { Page } from "@/core/shared/page";
import { useI18n } from "@/i18n/i18n-provider";
import { routes } from "@/lib/routes";
import { loadMoreArticles } from "@/server/actions";
import { ArticleCard } from "./article-card";
import { CategoryTabs, type CategoryFilter } from "./category-tabs";

export type ArticlePages = Record<CategoryFilter, Page<ArticleSummary>>;

interface ArticleExplorerProps {
  initialPages: ArticlePages;
  initialFilter?: CategoryFilter;
  /** Archive mode: fetch further pages. Landing mode: link to the archive instead. */
  mode: "preview" | "archive";
  onFilterChange?: (filter: CategoryFilter) => void;
}

/** Category tabs + animated article grid, shared by the landing page and the archive. */
export function ArticleExplorer({
  initialPages,
  initialFilter = "all",
  mode,
  onFilterChange,
}: ArticleExplorerProps) {
  const { locale, dict } = useI18n();
  const gridId = useId();
  const [filter, setFilter] = useState<CategoryFilter>(initialFilter);
  const [pages, setPages] = useState(initialPages);
  const [failed, setFailed] = useState(false);
  const [isLoading, startLoading] = useTransition();
  const page = pages[filter];

  function changeFilter(next: CategoryFilter) {
    setFilter(next);
    setFailed(false);
    onFilterChange?.(next);
  }

  function loadMore() {
    const cursor = page.nextCursor;
    if (!cursor) return;
    startLoading(async () => {
      try {
        const next = await loadMoreArticles(locale, filter === "all" ? null : filter, cursor);
        setPages((current) => ({
          ...current,
          [filter]: {
            items: [...current[filter].items, ...next.items],
            nextCursor: next.nextCursor,
          },
        }));
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <div>
      <div className="flex justify-center">
        <CategoryTabs value={filter} onChange={changeFilter} controls={gridId} />
      </div>

      <div id={gridId} role="tabpanel" className="mt-10">
        {page.items.length === 0 ? (
          <EmptyState message={dict.articles.empty} />
        ) : (
          <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {page.items.map((article, index) => (
                <motion.li
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
                >
                  <ArticleCard article={article} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        {mode === "preview" ? (
          <ButtonLink
            href={routes.articles(locale, filter === "all" ? undefined : filter)}
            variant="outline"
            size="lg"
          >
            {dict.articles.seeAll}
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        ) : (
          page.nextCursor && (
            <Button variant="outline" size="lg" onClick={loadMore} disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              {isLoading ? dict.articles.loading : dict.articles.loadMore}
            </Button>
          )
        )}
        {failed && (
          <p role="alert" className="text-sm text-rose-deep">
            {dict.articles.loadFailed}
          </p>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[2rem] bg-white/50 px-6 py-16 text-center">
      <Leaf size={44} className="animate-float text-moss" />
      <p className="font-hand text-2xl text-forest">{message}</p>
    </div>
  );
}
