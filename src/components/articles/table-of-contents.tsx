"use client";

import { ListTree } from "lucide-react";
import { useEffect, useState } from "react";
import { hasTableOfContents, type HeadingAnchor } from "@/core/rich-text/rich-text";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";

/** Tracks which heading the reader is currently looking at. */
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function TocLinks({ headings, active }: { headings: HeadingAnchor[]; active: string | null }) {
  return (
    <ol className="space-y-1 border-l-2 border-forest/10">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            aria-current={active === heading.id ? "location" : undefined}
            className={cn(
              "-ml-0.5 block border-l-2 py-1 pr-2 text-sm transition-colors",
              heading.level === 3 ? "pl-7" : "pl-4",
              active === heading.id
                ? "border-rose-deep font-bold text-forest"
                : "border-transparent text-ink/60 hover:text-forest",
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Collapsible on phones, a sticky side rail on large screens. */
export function TableOfContents({ headings }: { headings: HeadingAnchor[] }) {
  const { dict } = useI18n();
  const active = useActiveHeading(headings.map((heading) => heading.id));
  if (!hasTableOfContents(headings)) return null;

  return (
    <>
      <details className="group rounded-3xl bg-white/70 p-4 ring-1 ring-forest/5 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-forest">
          <ListTree className="size-4" aria-hidden />
          {dict.articles.toc}
          <span className="ml-auto text-xs transition group-open:rotate-180" aria-hidden>
            ▾
          </span>
        </summary>
        <nav aria-label={dict.articles.toc} className="mt-3">
          <TocLinks headings={headings} active={active} />
        </nav>
      </details>

      <nav aria-label={dict.articles.toc} className="sticky top-28 hidden lg:block">
        <p className="mb-3 flex items-center gap-2 text-xs font-extrabold tracking-[0.2em] text-ink/50 uppercase">
          <ListTree className="size-4" aria-hidden />
          {dict.articles.toc}
        </p>
        <TocLinks headings={headings} active={active} />
      </nav>
    </>
  );
}
