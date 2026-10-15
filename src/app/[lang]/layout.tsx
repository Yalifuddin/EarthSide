import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Caveat, Marcellus, Nunito } from "next/font/google";
import { MotionProvider } from "@/components/ui/motion-provider";
import { siteConfig } from "@/config/site";
import { LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/i18n/i18n-provider";
import "../globals.css";

const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: dict.meta.title, template: `%s · ${siteConfig.name}` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, dict } = await getDictionary();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${marcellus.variable} ${nunito.variable} ${caveat.variable}`}
    >
      <body className="min-h-dvh overflow-x-clip">
        {/* Entrance animations start hidden; without JavaScript, show everything as-is. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <I18nProvider locale={locale} dict={dict}>
          <MotionProvider>{children}</MotionProvider>
        </I18nProvider>
        {/* Page-view stats in the Vercel dashboard; does nothing outside Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
