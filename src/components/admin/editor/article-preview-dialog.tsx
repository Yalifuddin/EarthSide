"use client";

import { Eye, X } from "lucide-react";
import { ArticleCover, ArticleHeader } from "@/components/articles/article-header";
import { Dialog } from "@/components/ui/dialog";
import type { ArticleSummary } from "@/core/articles/article";
import { useI18n } from "@/i18n/i18n-provider";

export type PreviewArticle = Pick<
  ArticleSummary,
  | "title"
  | "category"
  | "language"
  | "authorName"
  | "publishedAt"
  | "readingMinutes"
  | "coverImageUrl"
  | "coverImageAlt"
>;

interface ArticlePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  article: PreviewArticle;
  /** HTML produced by the editor itself from the current (unsaved) content. */
  html: string;
}

/** Shows the article exactly as readers will see it — before it is published. */
export function ArticlePreviewDialog({ open, onClose, article, html }: ArticlePreviewDialogProps) {
  const { locale, dict } = useI18n();

  return (
    <Dialog open={open} onClose={onClose} className="max-w-5xl bg-blush">
      {({ titleId }) => (
        <div>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-ocean px-5 py-3 text-cream">
            <p id={titleId} className="flex items-center gap-2 text-sm font-bold">
              <Eye className="size-4" aria-hidden />
              {dict.admin.editor.previewNotice}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.about.close}
              className="grid size-9 place-items-center rounded-full hover:bg-cream/15"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="px-4 py-10 sm:px-10">
            <div className="mx-auto max-w-3xl">
              <ArticleHeader
                article={{ ...article, title: article.title || dict.admin.editor.untitled }}
                locale={locale}
                dict={dict}
              />
            </div>
            <div className="mx-auto mt-10 max-w-4xl">
              <ArticleCover
                src={article.coverImageUrl}
                alt={article.coverImageAlt || article.title}
              />
            </div>
            <div
              lang={article.language}
              className="article-prose mx-auto mt-12 max-w-3xl"
              // The author's own editor output, shown only to the author.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
