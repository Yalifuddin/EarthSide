import type { Metadata } from "next";
import { Suspense } from "react";
import { Archive, ArchiveExplorer } from "@/components/articles/archive-explorer";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/i18n/get-dictionary";
import { getArticlePagesByCategory } from "@/server/article-queries";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.articles.archiveTitle, description: dict.articles.archiveSubtitle };
}

export default async function ArticlesPage() {
  const { dict } = await getDictionary();
  const pages = await getArticlePagesByCategory();

  return (
    <section className="min-h-dvh pt-36 pb-24">
      <Container>
        <SectionHeading
          eyebrow={dict.articles.eyebrow}
          title={dict.articles.archiveTitle}
          subtitle={dict.articles.archiveSubtitle}
        />
        <div className="mt-12">
          {/* Reading the URL needs a boundary; the prerendered fallback is the default view. */}
          <Suspense fallback={<Archive initialPages={pages} />}>
            <ArchiveExplorer initialPages={pages} />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
