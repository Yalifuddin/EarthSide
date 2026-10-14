"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDialogBehavior } from "@/hooks/use-dialog-behavior";
import { cn } from "@/lib/cn";

type PanelMotion = Pick<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "transition">;

const POP: PanelMotion = {
  initial: { opacity: 0, scale: 0.92, y: 24 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 12 },
  transition: { type: "spring", stiffness: 260, damping: 26 },
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Render prop; put `titleId` on the dialog's heading to give it an accessible name. */
  children: (ids: { titleId: string }) => ReactNode;
  className?: string;
  panelMotion?: PanelMotion;
}

export function Dialog({ open, onClose, children, className, panelMotion = POP }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogBehavior(open, onClose, panelRef);
  const isClient = useIsClient();

  // Portalled to <body> so no ancestor's stacking context can trap it under the navbar.
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-forest/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem]",
              className,
            )}
            {...panelMotion}
          >
            {children({ titleId })}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const noopSubscribe = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
