import { ArticlesSection } from "@/components/landing/articles/articles-section";
import { ContactSection } from "@/components/landing/contact/contact-section";
import { HeroSection } from "@/components/landing/hero/hero-section";
import { RequestSection } from "@/components/landing/request/request-section";

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
