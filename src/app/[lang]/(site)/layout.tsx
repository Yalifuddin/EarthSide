import { AboutProvider } from "@/components/landing/about-context";
import { BackToTop } from "@/components/layout/back-to-top";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

/** Chrome shared by all public (reader-facing) pages. */
export default function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <AboutProvider>
      <Navbar />
      <main>{children}</main>
      <DemoBanner />
      <Footer />
      <BackToTop />
    </AboutProvider>
  );
}
