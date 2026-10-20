"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/i18n-provider";

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  /** Defaults to the destructive "Yes, delete". */
  confirmLabel?: string;
  tone?: "danger" | "primary";
}

export function ConfirmDialog({
  open,
  message,
  onConfirm,
  onClose,
  confirmLabel,
  tone = "danger",
}: ConfirmDialogProps) {
  const { dict } = useI18n();
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      {({ titleId }) => (
        <div className="p-7 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-soft text-rose-deep">
            <TriangleAlert className="size-6" aria-hidden />
          </span>
          <p id={titleId} className="mt-4 text-lg font-semibold text-forest">
            {message}
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Button variant="ghost" onClick={onClose} disabled={pending}>
              {dict.admin.actions.cancel}
            </Button>
            <Button variant={tone} onClick={confirm} disabled={pending}>
              {pending && <Spinner />}
              {confirmLabel ?? dict.admin.actions.confirmDelete}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
