import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/i18n/get-dictionary";
import { SECTION_IDS } from "@/lib/routes";
import { ContactCard } from "./contact-card";
import { Leaf } from "./floating-leaves";

/** Section 4 — how to reach Della. */
export async function ContactSection() {
  const { dict } = await getDictionary();

  return (
    <section
      id={SECTION_IDS.contact}
      className="relative overflow-hidden bg-blush py-24"
      aria-labelledby="contact-title"
    >
      <Leaf
        size={64}
        className="absolute top-16 left-[8%] hidden -rotate-12 animate-float text-moss/60 md:block"
      />
      <Leaf
        size={44}
        className="absolute right-[10%] bottom-20 hidden rotate-45 animate-float-slow text-rose md:block"
      />

      <Container>
        <SectionHeading
          id="contact-title"
          eyebrow={dict.contact.eyebrow}
          title={dict.contact.title}
          subtitle={dict.contact.subtitle}
        />
        <Reveal delay={0.1} className="mt-12">
          <ContactCard />
        </Reveal>
      </Container>
    </section>
  );
}
