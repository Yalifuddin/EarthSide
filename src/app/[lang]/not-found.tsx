import { Compass } from "lucide-react";
import { Leaf } from "@/components/landing/floating-leaves";
import { ButtonLink } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export default async function NotFound() {
  const { locale, dict } = await getDictionary();

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 text-center">
      <Leaf
        size={80}
        className="absolute top-[15%] left-[12%] -rotate-12 animate-float text-moss/50"
      />
      <Leaf
        size={56}
        className="absolute right-[14%] bottom-[18%] rotate-45 animate-float-slow text-rose/60"
      />
      <div>
        <Compass className="mx-auto size-16 animate-spin-slow text-leaf" aria-hidden />
        <p className="mt-6 font-hand text-3xl text-rose-deep">404</p>
        <h1 className="mt-2 font-display text-4xl text-forest text-balance sm:text-5xl">
          {dict.notFound.title}
        </h1>
        <p className="mt-3 text-ink/70">{dict.notFound.body}</p>
        <ButtonLink href={routes.home(locale)} className="mt-8" size="lg">
          {dict.notFound.back}
        </ButtonLink>
      </div>
    </main>
  );
}
