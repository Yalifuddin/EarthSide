"use client";

import Script from "next/script";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useI18n } from "@/i18n/i18n-provider";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      language?: string;
      appearance?: "always" | "execute" | "interaction-only";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileHandle {
  /** Turnstile tokens are single-use: reset after every submission. */
  reset(): void;
}

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string) => void;
}

/**
 * Cloudflare Turnstile. With `interaction-only` most visitors never see it;
 * it only asks for a click when something looks suspicious.
 */
export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ siteKey, onToken }, ref) {
    const { locale } = useI18n();
    const container = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    useEffect(() => {
      onTokenRef.current = onToken;
    });

    const render = useCallback(() => {
      if (!window.turnstile || !container.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        language: locale,
        appearance: "interaction-only",
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    }, [siteKey, locale]);

    // Covers the case where the script was already loaded by an earlier visit to this page.
    useEffect(() => {
      render();
      return () => {
        if (widgetId.current) window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      };
    }, [render]);

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
        onTokenRef.current("");
      },
    }));

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={render}
        />
        <div ref={container} className="flex justify-center empty:hidden" />
      </>
    );
  },
);
