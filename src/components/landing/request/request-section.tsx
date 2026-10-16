import { Container } from "@/components/ui/container";
import { Leaf } from "@/components/ui/leaf";
import { Reveal } from "@/components/ui/reveal";
import { ScallopEdge } from "@/components/ui/scallop-edge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/i18n/get-dictionary";
import { SECTION_IDS } from "@/lib/routes";
import { PaperPlane } from "./paper-plane";
import { RequestForm } from "./request-form";

/** Section 3 — readers suggest topics for Della to write about. */
export async function RequestSection() {
  const { dict } = await getDictionary();

  return (
    <section id={SECTION_IDS.request} className="relative bg-blush" aria-labelledby="request-title">
      <ScallopEdge color="var(--color-forest)" />
      <div className="relative overflow-hidden bg-forest py-24 text-cream">
        <div
          aria-hidden
          className="absolute -right-20 -bottom-24 size-96 rounded-full bg-ocean/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute top-10 -left-24 size-72 rounded-full bg-moss/20 blur-3xl"
        />

        <Container className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading
              id="request-title"
              align="left"
              tone="light"
              eyebrow={dict.request.eyebrow}
              title={dict.request.title}
              subtitle={dict.request.subtitle}
            />
            <Reveal delay={0.2} className="relative mt-10 hidden h-48 lg:block">
              <div className="absolute top-0 left-4 animate-float">
                <PaperPlane className="w-40 -rotate-6 text-cream" />
              </div>
              <svg
                aria-hidden
                viewBox="0 0 300 120"
                className="absolute top-16 left-0 w-72 text-rose/70"
                fill="none"
              >
                <path
                  d="M10 100 C 60 20, 120 120, 180 60 S 260 40, 290 10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                />
              </svg>
              <Leaf size={34} className="absolute right-20 bottom-4 animate-float-slow text-moss" />
              <p className="absolute bottom-0 left-6 -rotate-3 font-hand text-2xl text-rose">
                {dict.request.note}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <RequestForm />
          </Reveal>
        </Container>
      </div>
      <ScallopEdge color="var(--color-forest)" className="rotate-180" />
    </section>
  );
}
