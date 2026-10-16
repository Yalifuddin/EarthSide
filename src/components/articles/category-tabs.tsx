"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/core/articles/article";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";

export type CategoryFilter = "all" | ArticleCategory;
const CATEGORY_FILTERS: CategoryFilter[] = ["all", ...ARTICLE_CATEGORIES];

interface CategoryTabsProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  controls: string;
}

export function CategoryTabs({ value, onChange, controls }: CategoryTabsProps) {
  const { dict } = useI18n();
  const pillId = useId();

  return (
    <div
      role="tablist"
      aria-label={dict.nav.articles}
      className="inline-flex rounded-full bg-white/70 p-1.5 shadow-inner ring-1 ring-forest/5"
    >
      {CATEGORY_FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={controls}
            onClick={() => onChange(filter)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-bold transition-colors sm:px-5",
              active ? "text-cream" : "text-forest/70 hover:text-forest",
            )}
          >
            {active && (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0 rounded-full bg-forest"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{dict.categories[filter]}</span>
          </button>
        );
      })}
    </div>
  );
}
