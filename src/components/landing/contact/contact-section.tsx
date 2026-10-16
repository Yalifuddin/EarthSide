import { Container } from "@/components/ui/container";
import { Leaf } from "@/components/ui/leaf";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/i18n/get-dictionary";
import { SECTION_IDS } from "@/lib/routes";
import { EmailCard } from "./email-card";
import { InstagramCard } from "./instagram-card";

/** Section 4 — how to reach Della: email and Instagram. */
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
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal delay={0.1} className="h-full">
            <EmailCard />
          </Reveal>
          <Reveal delay={0.2} className="h-full">
            <InstagramCard dict={dict} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
