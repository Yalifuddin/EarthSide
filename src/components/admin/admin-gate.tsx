"use client";

import { LockKeyhole, LogIn, ShieldX } from "lucide-react";
import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { isAdminAvailable } from "@/composition/admin-services";
import { interpolate } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { routes } from "@/lib/routes";
import { useAdminAuth } from "./admin-auth-provider";

/** Renders its children only for a signed-in admin; otherwise the right sign-in / denied screen. */
export function AdminGate({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useAdminAuth();

  if (!isAdminAvailable) return <UnavailableScreen />;
  if (status === "loading") return <LoadingScreen />;
  if (status === "signedOut") return <SignInScreen />;
  if (!isAdmin) return <DeniedScreen />;
  return <>{children}</>;
}

function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-blush px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[2.5rem] bg-cream bg-grain p-8 text-center shadow-[0_30px_60px_-40px_rgb(10_51_35/0.8)] sm:p-10"
      >
        <Logo className="mx-auto w-28" priority />
        {children}
      </motion.div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-blush">
      <Spinner className="size-8 text-leaf" />
    </main>
  );
}

function SignInScreen() {
  const { dict } = useI18n();
  const { signIn, services } = useAdminAuth();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSignIn() {
    setPending(true);
    setFailed(false);
    try {
      await signIn();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <CenteredCard>
      <LockKeyhole className="mx-auto mt-6 size-6 text-rose-deep" aria-hidden />
      <h1 className="mt-3 font-display text-3xl text-forest">{dict.admin.signInTitle}</h1>
      <p className="mt-2 text-ink/70">{dict.admin.signInBody}</p>
      <Button size="lg" className="mt-8 w-full" onClick={handleSignIn} disabled={pending}>
        {pending ? <Spinner /> : <GoogleMark />}
        {pending
          ? dict.admin.signingIn
          : services.isDemo
            ? dict.admin.signInDemo
            : dict.admin.signIn}
      </Button>
      {failed && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rose-deep">
          {dict.admin.signInFailed}
        </p>
      )}
      <BackToSite />
    </CenteredCard>
  );
}

function DeniedScreen() {
  const { dict } = useI18n();
  const { user, signOut } = useAdminAuth();
  return (
    <CenteredCard>
      <ShieldX className="mx-auto mt-6 size-7 text-rose-deep" aria-hidden />
      <h1 className="mt-3 font-display text-3xl text-forest">{dict.admin.deniedTitle}</h1>
      <p className="mt-2 text-ink/70">
        {interpolate(dict.admin.deniedBody, { email: user?.email ?? "" })}
      </p>
      <Button variant="outline" className="mt-8" onClick={signOut}>
        <LogIn className="size-4" aria-hidden />
        {dict.admin.signOut}
      </Button>
      <BackToSite />
    </CenteredCard>
  );
}

function UnavailableScreen() {
  const { dict } = useI18n();
  return (
    <CenteredCard>
      <h1 className="mt-6 font-display text-3xl text-forest">{dict.admin.unavailableTitle}</h1>
      <p className="mt-2 text-ink/70">{dict.admin.unavailableBody}</p>
      <BackToSite />
    </CenteredCard>
  );
}

function BackToSite() {
  const { locale, dict } = useI18n();
  return (
    <ButtonLink href={routes.home(locale)} variant="ghost" size="sm" className="mt-4">
      {dict.admin.backToSite}
    </ButtonLink>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#fbbc05" d="M5.3 14.3a7 7 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8z" />
      <path
        fill="#ea4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l3.9 3.1A7.2 7.2 0 0 1 12 4.8"
      />
      <path
        fill="#34a853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-3a7.3 7.3 0 0 1-10.9-3.8l-3.9 3A12 12 0 0 0 12 24"
      />
      <path
        fill="#4285f4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6l3.8 3c2.3-2.1 3.6-5.2 3.6-8.8"
      />
    </svg>
  );
}
