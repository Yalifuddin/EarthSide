"use client";

import { Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormField, inputClasses } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import type { FieldErrors } from "@/core/shared/validation";
import type { TopicRequestInput } from "@/core/topic-requests/topic-request";
import { TOPIC_REQUEST_LIMITS } from "@/core/topic-requests/topic-request-validation";
import { useI18n } from "@/i18n/i18n-provider";
import { env } from "@/config/env";
import { submitTopicRequest } from "@/server/actions";
import { TurnstileWidget, type TurnstileHandle } from "./turnstile-widget";

type Status = "idle" | "submitting" | "success";
type SubmitError = "rate_limited" | "challenge_failed" | "failed";

const EMPTY_FORM: TopicRequestInput = { email: "", topic: "", description: "" };

export function RequestForm() {
  const { dict } = useI18n();
  const t = dict.request;
  const idPrefix = useId();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<TopicRequestInput>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [humanToken, setHumanToken] = useState("");
  const turnstile = useRef<TurnstileHandle>(null);
  const needsChallenge = Boolean(env.turnstileSiteKey);
  const errorMessages: Record<SubmitError, string> = {
    rate_limited: t.rateLimited,
    challenge_failed: t.challengeFailed,
    failed: t.failed,
  };

  const errorFor = (field: keyof TopicRequestInput) => {
    const code = errors[field];
    return code ? dict.validation[code] : undefined;
  };

  function update(field: keyof TopicRequestInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const honeypot = new FormData(event.currentTarget).get("website");
    setStatus("submitting");
    setSubmitError(null);

    const result = await submitTopicRequest({
      ...values,
      website: String(honeypot ?? ""),
      humanToken,
    });
    turnstile.current?.reset();
    if (result.ok) {
      setStatus("success");
      setValues(EMPTY_FORM);
      return;
    }
    if (result.reason === "invalid") {
      setErrors(result.errors);
      setStatus("idle");
      return;
    }
    setSubmitError(result.reason);
    setStatus("idle");
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-cream p-6 shadow-2xl sm:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <SuccessMessage key="success" onReset={() => setStatus("idle")} />
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 60, rotate: 2 }}
            className="space-y-5"
          >
            <FormField
              id={`${idPrefix}-email`}
              label={t.emailLabel}
              hint={t.emailHint}
              error={errorFor("email")}
            >
              {(field) => (
                <input
                  {...field}
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={TOPIC_REQUEST_LIMITS.email.max}
                  placeholder={t.emailPlaceholder}
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={inputClasses}
                />
              )}
            </FormField>

            <FormField id={`${idPrefix}-topic`} label={t.topicLabel} error={errorFor("topic")}>
              {(field) => (
                <input
                  {...field}
                  type="text"
                  required
                  maxLength={TOPIC_REQUEST_LIMITS.topic.max}
                  placeholder={t.topicPlaceholder}
                  value={values.topic}
                  onChange={(e) => update("topic", e.target.value)}
                  className={inputClasses}
                />
              )}
            </FormField>

            <FormField
              id={`${idPrefix}-description`}
              label={t.descriptionLabel}
              error={errorFor("description")}
              counter={`${values.description.length} / ${TOPIC_REQUEST_LIMITS.description.max}`}
            >
              {(field) => (
                <textarea
                  {...field}
                  required
                  rows={4}
                  maxLength={TOPIC_REQUEST_LIMITS.description.max}
                  placeholder={t.descriptionPlaceholder}
                  value={values.description}
                  onChange={(e) => update("description", e.target.value)}
                  className={`${inputClasses} resize-none`}
                />
              )}
            </FormField>

            {/* Honeypot: hidden from people, irresistible to bots. */}
            <div aria-hidden className="absolute -left-[9999px]">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {needsChallenge && (
              <TurnstileWidget
                ref={turnstile}
                siteKey={env.turnstileSiteKey}
                onToken={setHumanToken}
              />
            )}

            {submitError && (
              <p
                role="alert"
                className="rounded-2xl bg-rose-soft px-4 py-3 text-sm font-semibold text-rose-deep"
              >
                {errorMessages[submitError]}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={status === "submitting" || (needsChallenge && !humanToken)}
            >
              {status === "submitting" ? <Spinner /> : <Send className="size-4" aria-hidden />}
              {status === "submitting" ? t.submitting : t.submit}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessMessage({ onReset }: { onReset: () => void }) {
  const { dict } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center py-10 text-center"
      role="status"
    >
      <motion.div
        initial={{ x: -120, y: 60, rotate: -30, opacity: 0 }}
        animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
      >
        <PaperPlane className="w-28 text-forest" />
      </motion.div>
      <h3 className="mt-6 font-display text-3xl text-forest">{dict.request.successTitle}</h3>
      <p className="mt-2 max-w-sm text-ink/70">{dict.request.successBody}</p>
      <Button variant="outline" className="mt-8" onClick={onReset}>
        {dict.request.sendAnother}
      </Button>
    </motion.div>
  );
}

export function PaperPlane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden>
      <path
        d="M6 44 L112 6 L78 84 L56 56 Z"
        className="fill-cream"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M112 6 L56 56 L52 80 L66 64"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M6 44 L56 56" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
