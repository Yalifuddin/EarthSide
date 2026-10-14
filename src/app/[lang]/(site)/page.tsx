import { ArticlesSection } from "@/components/landing/articles-section";
import { ContactSection } from "@/components/landing/contact-section";
import { HeroSection } from "@/components/landing/hero-section";
import { RequestSection } from "@/components/landing/request-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ArticlesSection />
      <RequestSection />
      <ContactSection />
    </>
  );
}
