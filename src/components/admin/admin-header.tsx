"use client";

import { ExternalLink, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/i18n/i18n-provider";
import { routes } from "@/lib/routes";
import { useAdminAuth } from "./admin-auth-provider";

export function AdminHeader() {
  const { locale, dict } = useI18n();
  const { user, signOut, services } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-forest/10 bg-cream/85 backdrop-blur-md">
      {services.isDemo && (
        <p className="bg-ocean px-4 py-1.5 text-center text-xs font-semibold text-cream">
          {dict.admin.demoNotice}
        </p>
      )}
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={routes.admin(locale)} className="flex items-center gap-3">
          <Logo className="w-10" />
          <span className="font-display text-lg text-forest">{dict.admin.title}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={routes.home(locale)}
            target="_blank"
            className="hidden items-center gap-1 text-sm font-bold text-leaf hover:text-forest sm:inline-flex"
          >
            {dict.admin.backToSite}
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <LanguageSwitcher />
          {user?.photoUrl ? (
            <Image
              src={user.photoUrl}
              alt={user.displayName ?? ""}
              width={36}
              height={36}
              unoptimized
              className="size-9 rounded-full ring-2 ring-rose"
            />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-rose font-bold text-forest">
              {(user?.displayName ?? "D").charAt(0)}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} aria-label={dict.admin.signOut}>
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">{dict.admin.signOut}</span>
          </Button>
        </div>
      </Container>
    </header>
  );
}
