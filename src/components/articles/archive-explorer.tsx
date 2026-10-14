"use client";

import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { isArticleCategory } from "@/core/articles/article";
import { isSearchable, useArticleSearch } from "@/hooks/use-article-search";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { ArticleCard } from "./article-card";
import { ArticleExplorer, EmptyState, type ArticlePages } from "./article-explorer";
import type { CategoryFilter } from "./category-tabs";
import { SearchBox } from "./search-box";

interface ArchiveProps {
  initialPages: ArticlePages;
  initialFilter?: CategoryFilter;
  initialQuery?: string;
}

/** Mirrors archive state into the URL (`?category=`, `?q=`) so views can be shared. */
function syncUrl(key: "category" | "q", value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, "", url);
}

/** Search box + either search results or the category explorer. */
export function Archive({ initialPages, initialFilter = "all", initialQuery = "" }: ArchiveProps) {
  const { dict } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const search = useArticleSearch(query);

  function changeQuery(next: string) {
    setQuery(next);
    syncUrl("q", next.trim() || null);
  }

  return (
    <div>
      <SearchBox value={query} onChange={changeQuery} busy={search.status === "searching"} />

      <div className="mt-10">
        {isSearchable(query) ? (
          <div aria-live="polite">
            {search.status === "failed" && <EmptyState message={dict.articles.loadFailed} />}
            {search.status === "done" &&
              (search.results.length === 0 ? (
                <EmptyState
                  message={interpolate(dict.articles.searchEmpty, { query: search.query })}
                />
              ) : (
                <>
                  <p className="mb-6 text-center text-ink/60">
                    {interpolate(dict.articles.searchResults, {
                      count: search.results.length,
                      query: search.query,
                    })}
                  </p>
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {search.results.map((article, index) => (
                      <motion.li
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index, 6) * 0.05 }}
                      >
                        <ArticleCard article={article} />
                      </motion.li>
                    ))}
                  </ul>
                </>
              ))}
          </div>
        ) : (
          <ArticleExplorer
            mode="archive"
            initialPages={initialPages}
            initialFilter={initialFilter}
            onFilterChange={(filter) => syncUrl("category", filter === "all" ? null : filter)}
          />
        )}
      </div>
    </div>
  );
}

/** Reads the initial state from the URL (needs a Suspense boundary above it). */
export function ArchiveExplorer({ initialPages }: { initialPages: ArticlePages }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  return (
    <Archive
      initialPages={initialPages}
      initialFilter={isArticleCategory(category) ? category : "all"}
      initialQuery={searchParams.get("q") ?? ""}
    />
  );
}
