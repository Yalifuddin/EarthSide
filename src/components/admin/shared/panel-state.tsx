"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Leaf } from "@/components/ui/leaf";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/i18n-provider";

/** Shared loading / error / empty placeholders for dashboard panels. */
export function PanelLoading() {
  return (
    <div className="grid place-items-center py-20">
      <Spinner className="size-7 text-leaf" />
    </div>
  );
}

export function PanelError({ onRetry }: { onRetry: () => void }) {
  const { dict } = useI18n();
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="font-semibold text-rose-deep">{dict.admin.loadFailed}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw className="size-4" aria-hidden />
        {dict.admin.retry}
      </Button>
    </div>
  );
}

export function PanelEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Leaf size={44} className="animate-float text-moss" />
      <p className="font-hand text-2xl text-forest">{message}</p>
    </div>
  );
}
