"use client";

import type { Editor } from "@tiptap/react";
import { ArrowLeft, Check, Eye, History, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { Container } from "@/components/ui/container";
import { FormField, inputClasses } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_LANGUAGES,
  type Article,
  type ArticleInput,
  type ArticleStatus,
} from "@/core/articles/article";
import { ARTICLE_LIMITS } from "@/core/articles/article-validation";
import { siteConfig } from "@/config/site";
import {
  EMPTY_DOCUMENT,
  estimateReadingMinutes,
  type RichTextNode,
} from "@/core/rich-text/rich-text";
import { ValidationError, type FieldErrors } from "@/core/shared/validation";
import { formatDateTime, interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { refreshPublishedContent } from "@/server/actions";
import { useAdminServices } from "../admin-auth-provider";
import { ArticlePreviewDialog, type PreviewArticle } from "./article-preview-dialog";
import { CoverUploader } from "./cover-uploader";
import { RichTextEditor } from "./rich-text-editor";
import { useLocalDraft } from "./use-local-draft";

type FormValues = Omit<ArticleInput, "content" | "status">;
interface DraftSnapshot {
  values: FormValues;
  content: RichTextNode;
}
interface PreviewState {
  article: PreviewArticle;
  html: string;
}
type SaveState =
  { phase: "idle" } | { phase: "saving"; status: ArticleStatus } | { phase: "failed" };

function initialValues(article?: Article): FormValues {
  return {
    title: article?.title ?? "",
    category: article?.category ?? "national",
    language: article?.language ?? "id",
    coverImageUrl: article?.coverImageUrl ?? null,
    coverImageAlt: article?.coverImageAlt ?? "",
  };
}

/** Create/edit form for an article. Pass `article` to edit an existing one. */
export function ArticleEditor({ article }: { article?: Article }) {
  const { locale, dict } = useI18n();
  const t = dict.admin.editor;
  const { articles } = useAdminServices();
  const router = useRouter();
  const idPrefix = useId();

  const editorRef = useRef<Editor | null>(null);
  const [values, setValues] = useState<FormValues>(() => initialValues(article));
  const [errors, setErrors] = useState<FieldErrors<ArticleInput>>({});
  const [save, setSave] = useState<SaveState>({ phase: "idle" });
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  useUnsavedChangesWarning(dirty, t.unsavedChanges);

  // Autosave to this browser; the ref lets the debounced save read the latest values.
  const draft = useLocalDraft<DraftSnapshot>(article?.id ?? "new", article?.updatedAt ?? null);
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  });

  function markChanged() {
    setDirty(true);
    draft.schedule(() => ({
      values: valuesRef.current,
      content: editorRef.current?.getJSON() ?? EMPTY_DOCUMENT,
    }));
  }

  function restoreDraft() {
    if (!draft.recovered) return;
    const { values: saved, content } = draft.recovered.data;
    setValues(saved);
    editorRef.current?.commands.setContent(content);
    setDirty(true);
    draft.dismiss();
  }

  function openPreview() {
    const editor = editorRef.current;
    setPreview({
      html: editor?.getHTML() ?? "",
      article: {
        ...values,
        authorName: article?.authorName || siteConfig.author,
        publishedAt: article?.publishedAt ?? null,
        readingMinutes: estimateReadingMinutes(editor?.getText() ?? ""),
      },
    });
  }

  const isPublished = article?.status === "published";
  const errorFor = (field: keyof ArticleInput) => {
    const code = errors[field];
    return code ? dict.validation[code] : undefined;
  };

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    markChanged();
  }

  async function submit(status: ArticleStatus) {
    const input: ArticleInput = {
      ...values,
      status,
      content: editorRef.current?.getJSON() ?? EMPTY_DOCUMENT,
    };

    setSave({ phase: "saving", status });
    try {
      if (article) await articles.update(article.id, input);
      else await articles.create(input);

      await refreshPublishedContent();
      draft.clear();
      setDirty(false);
      router.push(routes.admin(locale));
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.errors as FieldErrors<ArticleInput>);
        setSave({ phase: "idle" });
      } else {
        console.error(error);
        setSave({ phase: "failed" });
      }
    }
  }

  const saving = save.phase === "saving";
  const contentErrorId = `${idPrefix}-content-error`;

  return (
    <Container className="max-w-4xl py-10">
      <Link
        href={routes.admin(locale)}
        className="inline-flex items-center gap-2 text-sm font-bold text-leaf hover:text-forest"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t.back}
      </Link>
      <h1 className="mt-4 font-display text-4xl text-forest">
        {article ? t.editTitle : t.newTitle}
      </h1>

      {draft.recovered && (
        <div
          role="status"
          className="mt-6 flex flex-col gap-3 rounded-3xl bg-ocean/10 p-4 text-ocean sm:flex-row sm:items-center"
        >
          <History className="size-5 shrink-0" aria-hidden />
          <p className="flex-1 text-sm font-semibold">
            {interpolate(t.draftRecovered, {
              time: formatDateTime(new Date(draft.recovered.savedAt), locale),
            })}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={draft.clear}>
              {t.discardDraft}
            </Button>
            <Button size="sm" onClick={restoreDraft}>
              {t.restoreDraft}
            </Button>
          </div>
        </div>
      )}

      <form
        className="mt-8 space-y-7"
        onSubmit={(event) => {
          event.preventDefault();
          void submit("published");
        }}
        noValidate
      >
        <FormField
          id={`${idPrefix}-title`}
          label={t.titleLabel}
          error={errorFor("title")}
          counter={`${values.title.length} / ${ARTICLE_LIMITS.title.max}`}
        >
          {(field) => (
            <input
              {...field}
              value={values.title}
              maxLength={ARTICLE_LIMITS.title.max}
              placeholder={t.titlePlaceholder}
              onChange={(e) => update("title", e.target.value)}
              className={cn(inputClasses, "font-display text-2xl")}
            />
          )}
        </FormField>

        <div className="flex flex-wrap gap-x-10 gap-y-6">
          <ChoiceGroup
            legend={t.categoryLabel}
            name="category"
            options={ARTICLE_CATEGORIES}
            value={values.category}
            onChange={(category) => update("category", category)}
            labelFor={(category) => dict.categories[category]}
          />
          <ChoiceGroup
            legend={t.languageLabel}
            name="language"
            options={ARTICLE_LANGUAGES}
            value={values.language}
            onChange={(language) => update("language", language)}
            labelFor={(language) => dict.languages[language]}
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-forest">{t.coverLabel}</p>
          <CoverUploader
            value={values.coverImageUrl}
            onChange={(url) => update("coverImageUrl", url)}
            error={errorFor("coverImageUrl")}
          />
          <FormField
            id={`${idPrefix}-alt`}
            label={t.coverAltLabel}
            error={errorFor("coverImageAlt")}
          >
            {(field) => (
              <input
                {...field}
                value={values.coverImageAlt}
                maxLength={ARTICLE_LIMITS.coverImageAlt.max}
                placeholder={t.coverAltPlaceholder}
                onChange={(e) => update("coverImageAlt", e.target.value)}
                className={inputClasses}
              />
            )}
          </FormField>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-bold text-forest">{t.contentLabel}</p>
          <RichTextEditor
            initialContent={article?.content ?? EMPTY_DOCUMENT}
            onReady={(editor) => (editorRef.current = editor)}
            onChange={() => {
              markChanged();
              setErrors((current) => ({ ...current, content: undefined }));
            }}
            invalid={Boolean(errors.content)}
            describedBy={errors.content ? contentErrorId : undefined}
          />
          {errors.content && (
            <p
              id={contentErrorId}
              role="alert"
              className="mt-1.5 text-sm font-semibold text-rose-deep"
            >
              {errorFor("content")}
            </p>
          )}
        </div>

        {save.phase === "failed" && (
          <p
            role="alert"
            className="rounded-2xl bg-rose-soft px-4 py-3 text-sm font-semibold text-rose-deep"
          >
            {t.saveFailed}
          </p>
        )}

        <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-3xl bg-cream/90 p-3 shadow-lg ring-1 ring-forest/10 backdrop-blur sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={openPreview} disabled={saving} className="sm:mr-auto">
            <Eye className="size-4" aria-hidden />
            {t.preview}
          </Button>
          <Button variant="outline" onClick={() => submit("draft")} disabled={saving}>
            {saving && save.status === "draft" ? <Spinner /> : null}
            {saving && save.status === "draft" ? t.saving : t.saveDraft}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && save.status === "published" ? (
              <Spinner />
            ) : isPublished ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {saving && save.status === "published" ? t.saving : isPublished ? t.update : t.publish}
          </Button>
        </div>
      </form>

      {preview && (
        <ArticlePreviewDialog
          open
          onClose={() => setPreview(null)}
          article={preview.article}
          html={preview.html}
        />
      )}
    </Container>
  );
}

/** Asks for confirmation before closing the tab with unsaved edits. */
function useUnsavedChangesWarning(dirty: boolean, message: string) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, message]);
}
