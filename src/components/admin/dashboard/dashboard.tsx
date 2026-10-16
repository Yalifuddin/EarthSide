"use client";

import { Inbox, Newspaper, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAdminAuth } from "@/components/admin/shell/admin-auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useAsyncData } from "@/hooks/use-async-data";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { ArticlesPanel } from "./articles-panel";
import { RequestsPanel } from "./requests-panel";

type Tab = "articles" | "requests";

const TAB_ICONS = { articles: Newspaper, requests: Inbox } as const;

export function Dashboard() {
  const { locale, dict } = useI18n();
  const { user, services } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("articles");
  const newRequests = useAsyncData(() => services.requests.countNew());
  const firstName = user?.displayName?.split(" ")[0] ?? "Della";

  return (
    <Container className="py-10">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-hand text-2xl text-rose-deep">
            {interpolate(dict.admin.greeting, { name: firstName })}
          </p>
          <h1 className="font-display text-4xl text-forest">{dict.admin.title}</h1>
          <p className="mt-1 text-ink/65">{dict.admin.subtitle}</p>
        </div>
        <ButtonLink href={routes.newArticle(locale)} size="lg">
          <Plus className="size-5" aria-hidden />
          {dict.admin.newArticle}
        </ButtonLink>
      </div>

      <div role="tablist" className="mt-10 flex gap-2 border-b border-forest/10">
        {(["articles", "requests"] as const).map((option) => {
          const Icon = TAB_ICONS[option];
          const active = tab === option;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(option)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 pb-3 font-bold transition-colors",
                active ? "text-forest" : "text-forest/50 hover:text-forest",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {dict.admin.tabs[option]}
              {option === "requests" && Boolean(newRequests.data) && (
                <span
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-deep px-1.5 text-xs text-cream"
                  aria-label={interpolate(dict.admin.newRequestsBadge, {
                    count: newRequests.data ?? 0,
                  })}
                >
                  {newRequests.data}
                </span>
              )}
              {active && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-x-0 -bottom-px h-1 rounded-full bg-rose"
                />
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-6">
        {tab === "articles" ? (
          <ArticlesPanel />
        ) : (
          <RequestsPanel onInboxChange={newRequests.reload} />
        )}
      </div>
    </Container>
  );
}
