"use client";

import type { Editor } from "@tiptap/react";
import { CheckCircle2, Languages, PenLine, RefreshCw, Save } from "lucide-react";
import { useId, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { TRANSLATION_STATE_TONE } from "@/components/admin/shared/translation-state";
import { useAdminServices } from "@/components/admin/shell/admin-auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, inputClasses } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import type { Article, TranslationInput } from "@/core/articles/article";
import { translationStateOf, translationTargetOf } from "@/core/articles/article-translation";
import { ARTICLE_LIMITS } from "@/core/articles/article-validation";
import { EMPTY_DOCUMENT } from "@/core/rich-text/rich-text";
import { ValidationError, type FieldErrors } from "@/core/shared/validation";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import { readDocument } from "@/lib/rich-text/read-document";
import { refreshPublishedContent } from "@/server/actions";
import { RichTextEditor } from "./rich-text-editor";
import { useMachineTranslation, type TranslationFailure } from "./use-machine-translation";

type Busy = "translating" | "saving" | "approving" | null;
type Notice = { tone: "success" | "error"; text: string } | null;

interface TranslationPanelProps {
  article: Article;
  /** Reload the article after a change, so status and fields stay in sync. */
  onChanged: () => Promise<unknown>;
}

/**
 * Review screen for an article's translation: machine output (or a manual
 * draft) can be edited, saved as a draft, and approved to go live.
 */
export function TranslationPanel({ article, onChanged }: TranslationPanelProps) {
  const { dict } = useI18n();
  const t = dict.admin.translation;
  const { articles } = useAdminServices();
  const machine = useMachineTranslation();
  const idPrefix = useId();

  const target = translationTargetOf(article.language);
  const translation = article.translations[target];
  const state = translationStateOf(article);
  const languageName = dict.languages[target];

  // Writing manually starts from a copy of the original, to translate in place.
  const [manualStart, setManualStart] = useState(false);
  const draft = translation?.draft ?? (manualStart ? article : null);

  const editorRef = useRef<Editor | null>(null);
  const [values, setValues] = useState({
    title: draft?.title ?? "",
    coverImageAlt: draft?.coverImageAlt ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors<TranslationInput>>({});
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirmRetranslate, setConfirmRetranslate] = useState(false);

  const errorFor = (field: keyof TranslationInput) => {
    const code = errors[field];
    return code ? dict.validation[code] : undefined;
  };

  function currentInput(): TranslationInput {
    return {
      ...values,
      content: editorRef.current ? readDocument(editorRef.current) : EMPTY_DOCUMENT,
    };
  }

  async function run(kind: Exclude<Busy, null>, action: () => Promise<Notice>) {
    setBusy(kind);
    setNotice(null);
    setErrors({});
    try {
      setNotice(await action());
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.errors as FieldErrors<TranslationInput>);
      } else {
        console.error(error);
        setNotice({ tone: "error", text: dict.admin.editor.saveFailed });
      }
    } finally {
      setBusy(null);
    }
  }

  const failure = (reason: TranslationFailure): Notice => ({
    tone: "error",
    text: t.errors[reason],
  });

  const translateAutomatically = () =>
    run("translating", async () => {
      const result = await machine.translateIntoDraft(article, article);
      if (!result.ok) return failure(result.reason);
      await onChanged();
      return null;
    });

  const saveDraft = () =>
    run("saving", async () => {
      await articles.saveTranslationDraft(article.id, currentInput());
      await onChanged();
      return { tone: "success", text: t.savedDraft };
    });

  const approve = () =>
    run("approving", async () => {
      await articles.approveTranslation(article.id, currentInput());
      await refreshPublishedContent();
      await onChanged();
      return { tone: "success", text: t.approved };
    });

  const explanation = interpolate(t.explain[state], {
    language: languageName,
    fallback: translation?.published ? t.fallbackPrevious : t.fallbackOriginal,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl bg-white/70 p-5 ring-1 ring-forest/5 sm:flex-row sm:items-start">
        <Languages className="mt-0.5 size-5 shrink-0 text-ocean" aria-hidden />
        <div className="flex-1 space-y-1">
          <Badge tone={TRANSLATION_STATE_TONE[state]}>{t.states[state]}</Badge>
          <p className="text-sm text-ink/75">{explanation}</p>
          <p className="text-xs text-ink/50">{machine.available ? t.sourceNote : t.unavailable}</p>
        </div>
      </div>

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={cn(
            "rounded-2xl px-4 py-3 text-sm font-semibold",
            notice.tone === "error" ? "bg-rose-soft text-rose-deep" : "bg-moss/20 text-leaf",
          )}
        >
          {notice.text}
        </p>
      )}

      {!draft ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-forest/15 px-6 py-12 text-center sm:flex-row sm:justify-center">
          {machine.available && (
            <Button onClick={translateAutomatically} disabled={busy !== null}>
              {busy === "translating" ? <Spinner /> : <Languages className="size-4" aria-hidden />}
              {busy === "translating" ? t.translating : t.autoTranslate}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setValues({ title: article.title, coverImageAlt: article.coverImageAlt });
              setManualStart(true);
            }}
            disabled={busy !== null}
          >
            <PenLine className="size-4" aria-hidden />
            {t.writeManually}
          </Button>
        </div>
      ) : (
        <>
          <FormField
            id={`${idPrefix}-title`}
            label={`${dict.admin.editor.titleLabel} (${languageName})`}
            error={errorFor("title")}
            counter={`${values.title.length} / ${ARTICLE_LIMITS.title.max}`}
          >
            {(field) => (
              <input
                {...field}
                lang={target}
                value={values.title}
                maxLength={ARTICLE_LIMITS.title.max}
                onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                className={cn(inputClasses, "font-display text-2xl")}
              />
            )}
          </FormField>

          <FormField
            id={`${idPrefix}-alt`}
            label={dict.admin.editor.coverAltLabel}
            error={errorFor("coverImageAlt")}
          >
            {(field) => (
              <input
                {...field}
                lang={target}
                value={values.coverImageAlt}
                maxLength={ARTICLE_LIMITS.coverImageAlt.max}
                onChange={(e) => setValues((v) => ({ ...v, coverImageAlt: e.target.value }))}
                className={inputClasses}
              />
            )}
          </FormField>

          <div lang={target}>
            <p className="mb-1.5 text-sm font-bold text-forest">{dict.admin.editor.contentLabel}</p>
            <RichTextEditor
              // A fresh draft (e.g. after translating again) replaces the editor's content.
              key={translation?.updatedAt.getTime() ?? "manual"}
              initialContent={draft.content}
              onReady={(editor) => (editorRef.current = editor)}
              onChange={() => setErrors((current) => ({ ...current, content: undefined }))}
              invalid={Boolean(errors.content)}
            />
            {errors.content && (
              <p role="alert" className="mt-1.5 text-sm font-semibold text-rose-deep">
                {errorFor("content")}
              </p>
            )}
          </div>

          <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-3xl bg-cream/90 p-3 shadow-lg ring-1 ring-forest/10 backdrop-blur sm:flex-row sm:justify-end">
            {machine.available && translation && (
              <Button
                variant="ghost"
                onClick={() => setConfirmRetranslate(true)}
                disabled={busy !== null}
                className="sm:mr-auto"
              >
                {busy === "translating" ? (
                  <Spinner />
                ) : (
                  <RefreshCw className="size-4" aria-hidden />
                )}
                {busy === "translating" ? t.translating : t.retranslate}
              </Button>
            )}
            <Button variant="outline" onClick={saveDraft} disabled={busy !== null}>
              {busy === "saving" ? <Spinner /> : <Save className="size-4" aria-hidden />}
              {busy === "saving" ? t.saving : t.saveDraft}
            </Button>
            <Button onClick={approve} disabled={busy !== null}>
              {busy === "approving" ? <Spinner /> : <CheckCircle2 className="size-4" aria-hidden />}
              {busy === "approving" ? t.saving : t.approve}
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmRetranslate}
        message={t.confirmRetranslate}
        confirmLabel={t.confirmRetranslateAction}
        tone="primary"
        onConfirm={translateAutomatically}
        onClose={() => setConfirmRetranslate(false)}
      />
    </div>
  );
}
