"use client";

import { Search, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/i18n-provider";
import { SEARCH_INPUT_ID } from "@/lib/routes";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  busy?: boolean;
}

export function SearchBox({ value, onChange, busy }: SearchBoxProps) {
  const { dict } = useI18n();

  return (
    <div role="search" className="relative mx-auto max-w-xl scroll-mt-32" id={SEARCH_INPUT_ID}>
      <label htmlFor={`${SEARCH_INPUT_ID}-input`} className="sr-only">
        {dict.nav.search}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-leaf"
        aria-hidden
      />
      <input
        id={`${SEARCH_INPUT_ID}-input`}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={dict.articles.searchPlaceholder}
        autoComplete="off"
        maxLength={100}
        className="h-14 w-full rounded-full border-2 border-forest/10 bg-white/80 pr-14 pl-13 text-ink shadow-inner transition placeholder:text-ink/40 focus:border-moss focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <span className="absolute top-1/2 right-4 -translate-y-1/2">
        {busy ? (
          <Spinner className="text-leaf" />
        ) : (
          value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={dict.articles.searchClear}
              className="grid size-8 place-items-center rounded-full text-forest hover:bg-forest/10"
            >
              <X className="size-4" aria-hidden />
            </button>
          )
        )}
      </span>
    </div>
  );
}
