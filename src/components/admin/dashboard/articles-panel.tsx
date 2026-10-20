"use client";

import { Eye, EyeOff, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ActionErrorBanner, useActionError } from "@/components/admin/shared/action-error";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { PanelEmpty, PanelError, PanelLoading } from "@/components/admin/shared/panel-state";
import { TRANSLATION_STATE_TONE } from "@/components/admin/shared/translation-state";
import { useAdminServices } from "@/components/admin/shell/admin-auth-provider";
import { CategoryBadge } from "@/components/articles/category-badge";
import { CoverImage } from "@/components/articles/cover-image";
import { LanguageBadge } from "@/components/articles/language-badge";
import { Badge } from "@/components/ui/badge";
import type { ArticleSummary } from "@/core/articles/article";
import { translationStateOf, translationTargetOf } from "@/core/articles/article-translation";
import { useAsyncData } from "@/hooks/use-async-data";
import { formatShortDate, interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { routes } from "@/lib/routes";
import { refreshPublishedContent } from "@/server/actions";

export function ArticlesPanel() {
  const { dict } = useI18n();
  const { articles: articleService } = useAdminServices();
  const articles = useAsyncData(() => articleService.listAll());
  const [pendingDelete, setPendingDelete] = useState<ArticleSummary | null>(null);
  const actionError = useActionError();

  const toggleStatus = (article: ArticleSummary) =>
    actionError.run(async () => {
      const next = article.status === "published" ? "draft" : "published";
      await articleService.setStatus(article.id, next);
      await refreshPublishedContent();
      await articles.reload();
    });

  const remove = (article: ArticleSummary) =>
    actionError.run(async () => {
      await articleService.delete(article.id);
      await refreshPublishedContent();
      articles.mutate((list) => list.filter((item) => item.id !== article.id));
    });

  if (articles.status === "loading" && !articles.data) return <PanelLoading />;
  if (articles.status === "error" && !articles.data)
    return <PanelError onRetry={articles.reload} />;
  if (!articles.data?.length) return <PanelEmpty message={dict.admin.noArticles} />;

  return (
    <>
      <ActionErrorBanner message={actionError.message} onDismiss={actionError.dismiss} />
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {articles.data.map((article) => (
            <motion.li
              key={article.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <ArticleRow
                article={article}
                onToggleStatus={() => toggleStatus(article)}
                onDelete={() => setPendingDelete(article)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        message={interpolate(dict.admin.confirmDeleteArticle, {
          title: pendingDelete?.title ?? "",
        })}
        onConfirm={() => (pendingDelete ? remove(pendingDelete) : Promise.resolve())}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}

interface ArticleRowProps {
  article: ArticleSummary;
  onToggleStatus: () => Promise<void>;
  onDelete: () => void;
}

function ArticleRow({ article, onToggleStatus, onDelete }: ArticleRowProps) {
  const { locale, dict } = useI18n();
  const [toggling, setToggling] = useState(false);
  const isPublished = article.status === "published";

  async function toggle() {
    setToggling(true);
    try {
      await onToggleStatus();
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white/75 p-3 ring-1 ring-forest/5 sm:flex-row sm:items-center">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl sm:w-28">
        <CoverImage src={article.coverImageUrl} alt="" sizes="112px" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isPublished ? "moss" : "muted"}>{dict.admin.status[article.status]}</Badge>
          <CategoryBadge category={article.category} dict={dict} />
          <LanguageBadge language={article.language} dict={dict} />
          <TranslationBadge article={article} />
        </div>
        <p className="mt-2 truncate font-display text-lg text-forest">{article.title}</p>
        <p className="text-xs text-ink/55">
          {dict.admin.columns.updated}: {formatShortDate(article.updatedAt, locale)}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 sm:justify-end">
        {isPublished && (
          <IconLink
            href={routes.article(locale, article.slug)}
            label={dict.admin.actions.view}
            external
          >
            <ExternalLink className="size-4" />
          </IconLink>
        )}
        <IconLink href={routes.editArticle(locale, article.id)} label={dict.admin.actions.edit}>
          <Pencil className="size-4" />
        </IconLink>
        <IconButton
          label={isPublished ? dict.admin.actions.unpublish : dict.admin.actions.publish}
          onClick={toggle}
          disabled={toggling}
        >
          {isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </IconButton>
        <IconButton label={dict.admin.actions.delete} onClick={onDelete} tone="danger">
          <Trash2 className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

const iconClasses =
  "inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold transition disabled:opacity-50";

function IconLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className={`${iconClasses} text-forest hover:bg-forest/8`}
    >
      {children}
      <span>{label}</span>
    </Link>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${iconClasses} ${tone === "danger" ? "text-rose-deep hover:bg-rose-soft" : "text-forest hover:bg-forest/8"}`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

/** "English · Needs review" — what the article's translation is waiting for. */
function TranslationBadge({ article }: { article: ArticleSummary }) {
  const { dict } = useI18n();
  const t = dict.admin.translation;
  const state = translationStateOf(article);
  return (
    <Badge tone={TRANSLATION_STATE_TONE[state]}>
      {interpolate(t.badge, {
        language: dict.languages[translationTargetOf(article.language)],
        state: t.states[state],
      })}
    </Badge>
  );
}
