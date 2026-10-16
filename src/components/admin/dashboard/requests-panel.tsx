"use client";

import { Mail, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ActionErrorBanner, useActionError } from "@/components/admin/shared/action-error";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { PanelEmpty, PanelError, PanelLoading } from "@/components/admin/shared/panel-state";
import { useAdminServices } from "@/components/admin/shell/admin-auth-provider";
import { Badge } from "@/components/ui/badge";
import { inputClasses } from "@/components/ui/form-field";
import { siteConfig } from "@/config/site";
import {
  TOPIC_REQUEST_STATUSES,
  type TopicRequest,
  type TopicRequestStatus,
} from "@/core/topic-requests/topic-request";
import { useAsyncData } from "@/hooks/use-async-data";
import { formatShortDate, interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import { gmailComposeUrl } from "@/lib/gmail";

type StatusFilter = "all" | TopicRequestStatus;

const STATUS_TONE = { new: "rose", read: "ocean", done: "moss" } as const;

/** `onInboxChange` lets the dashboard refresh its "new requests" badge. */
export function RequestsPanel({ onInboxChange }: { onInboxChange?: () => void }) {
  const { dict } = useI18n();
  const { requests: requestService } = useAdminServices();
  const requests = useAsyncData(() => requestService.listAll());
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<TopicRequest | null>(null);
  const actionError = useActionError();

  const changeStatus = (request: TopicRequest, status: TopicRequestStatus) =>
    actionError.run(async () => {
      // Optimistic: show the new status immediately, roll back by reloading on failure.
      requests.mutate((list) =>
        list.map((item) => (item.id === request.id ? { ...item, status } : item)),
      );
      try {
        await requestService.updateStatus(request.id, status);
      } catch (error) {
        await requests.reload();
        throw error;
      } finally {
        onInboxChange?.();
      }
    });

  const remove = (request: TopicRequest) =>
    actionError.run(async () => {
      await requestService.delete(request.id);
      requests.mutate((list) => list.filter((item) => item.id !== request.id));
      onInboxChange?.();
    });

  if (requests.status === "loading" && !requests.data) return <PanelLoading />;
  if (requests.status === "error" && !requests.data)
    return <PanelError onRetry={requests.reload} />;

  const all = requests.data ?? [];
  const visible = filter === "all" ? all : all.filter((request) => request.status === filter);
  const filters: StatusFilter[] = ["all", ...TOPIC_REQUEST_STATUSES];

  return (
    <>
      <ActionErrorBanner message={actionError.message} onDismiss={actionError.dismiss} />
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((option) => {
          const count =
            option === "all" ? all.length : all.filter((r) => r.status === option).length;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-bold transition",
                filter === option
                  ? "bg-forest text-cream"
                  : "bg-white/70 text-forest hover:bg-white",
              )}
            >
              {option === "all" ? dict.admin.filterAll : dict.admin.requestStatus[option]} · {count}
            </button>
          );
        })}
      </div>

      <p className="mb-5 flex items-center gap-2 text-sm text-ink/60">
        <Mail className="size-4 shrink-0 text-leaf" aria-hidden />
        {interpolate(dict.admin.replyFrom, { email: siteConfig.contactEmail })}
      </p>

      {visible.length === 0 ? (
        <PanelEmpty message={dict.admin.noRequests} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {visible.map((request) => (
              <motion.li
                key={request.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <RequestCard
                  request={request}
                  onStatusChange={(status) => changeStatus(request, status)}
                  onDelete={() => setPendingDelete(request)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        message={interpolate(dict.admin.confirmDeleteRequest, {
          topic: pendingDelete?.topic ?? "",
        })}
        onConfirm={() => (pendingDelete ? remove(pendingDelete) : Promise.resolve())}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}

interface RequestCardProps {
  request: TopicRequest;
  onStatusChange: (status: TopicRequestStatus) => void;
  onDelete: () => void;
}

function RequestCard({ request, onStatusChange, onDelete }: RequestCardProps) {
  const { locale, dict } = useI18n();
  // Replies always go out from the official address, whoever is signed in.
  const replyHref = gmailComposeUrl({
    from: siteConfig.contactEmail,
    to: request.email,
    subject: `EarthSide: ${request.topic}`,
  });

  return (
    <article className="flex h-full flex-col rounded-3xl bg-white/75 p-5 ring-1 ring-forest/5">
      <div className="flex items-start justify-between gap-3">
        <Badge tone={STATUS_TONE[request.status]}>{dict.admin.requestStatus[request.status]}</Badge>
        <time className="text-xs text-ink/55" dateTime={request.createdAt.toISOString()}>
          {formatShortDate(request.createdAt, locale)}
        </time>
      </div>
      <h3 className="mt-3 font-display text-xl text-forest">{request.topic}</h3>
      <p className="mt-2 flex-1 text-sm whitespace-pre-line text-ink/75">{request.description}</p>
      <p className="mt-3 truncate text-sm font-semibold text-ocean">{request.email}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-forest/10 pt-4">
        <label className="sr-only" htmlFor={`status-${request.id}`}>
          {dict.admin.columns.status}
        </label>
        <select
          id={`status-${request.id}`}
          value={request.status}
          onChange={(event) => onStatusChange(event.target.value as TopicRequestStatus)}
          className={cn(inputClasses, "w-auto py-2 text-sm")}
        >
          {TOPIC_REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {dict.admin.requestStatus[status]}
            </option>
          ))}
        </select>
        <a
          href={replyHref}
          target="_blank"
          rel="noopener noreferrer"
          title={interpolate(dict.admin.replyFrom, { email: siteConfig.contactEmail })}
          className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-forest hover:bg-forest/8"
        >
          <Mail className="size-4" aria-hidden />
          {dict.admin.actions.reply}
        </a>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-rose-deep hover:bg-rose-soft"
        >
          <Trash2 className="size-4" aria-hidden />
          {dict.admin.actions.delete}
        </button>
      </div>
    </article>
  );
}
