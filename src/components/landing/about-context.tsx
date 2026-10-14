"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AboutDialog } from "./about-dialog";

interface AboutContextValue {
  openAbout: () => void;
}

const AboutContext = createContext<AboutContextValue | null>(null);

/**
 * Owns the single "About us" dialog so any trigger — the globe, the navbar,
 * the footer — can open it from any public page.
 */
export function AboutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openAbout = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openAbout }), [openAbout]);

  return (
    <AboutContext.Provider value={value}>
      {children}
      <AboutDialog open={open} onClose={() => setOpen(false)} />
    </AboutContext.Provider>
  );
}

export function useAbout(): AboutContextValue {
  const context = useContext(AboutContext);
  if (!context) throw new Error("useAbout must be used inside <AboutProvider>");
  return context;
}

interface AboutTriggerProps {
  className?: string;
  /** Extra work to do when clicked, e.g. closing a mobile menu. */
  onOpen?: () => void;
  children: ReactNode;
}

/** A plain button that opens the About dialog; style it via `className`. */
export function AboutTrigger({ className, onOpen, children }: AboutTriggerProps) {
  const { openAbout } = useAbout();
  function handleClick() {
    onOpen?.();
    openAbout();
  }
  return (
    <button type="button" onClick={handleClick} aria-haspopup="dialog" className={className}>
      {children}
    </button>
  );
}
