"use client";

import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { PermissionDeniedError } from "@/core/shared/errors";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { useAdminAuth } from "./admin-auth-provider";

/**
 * Runs a dashboard action and turns a failure into a readable message instead
 * of an unhandled rejection. Render `<ActionErrorBanner>` with the result.
 */
export function useActionError() {
  const { dict } = useI18n();
  const { user } = useAdminAuth();
  const [message, setMessage] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setMessage(null);
      try {
        await action();
      } catch (error) {
        if (error instanceof PermissionDeniedError) {
          setMessage(interpolate(dict.admin.editor.permissionDenied, { email: user?.email ?? "" }));
        } else {
          console.error(error);
          setMessage(dict.admin.actionFailed);
        }
      }
    },
    [dict, user],
  );

  return { message, run, dismiss: () => setMessage(null) };
}

export function ActionErrorBanner({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  const { dict } = useI18n();
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-3 rounded-2xl bg-rose-soft px-4 py-3 text-sm font-semibold text-rose-deep"
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={dict.about.close}
        className="grid size-6 shrink-0 place-items-center rounded-full hover:bg-rose/30"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
