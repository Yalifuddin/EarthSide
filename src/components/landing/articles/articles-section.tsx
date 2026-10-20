import { ArticleExplorer } from "@/components/articles/article-explorer";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/i18n/get-dictionary";
import { SECTION_IDS } from "@/lib/routes";
import { getArticlePagesByCategory } from "@/server/article-queries";

const PREVIEW_COUNT = 6;

/** Section 2 — the collection of Della's articles. */
export async function ArticlesSection() {
  const { locale, dict } = await getDictionary();
  const pages = await getArticlePagesByCategory(locale, PREVIEW_COUNT);

  return (
    <section
      id={SECTION_IDS.articles}
      className="relative bg-blush py-24"
      aria-labelledby="articles-title"
    >
      <Container>
        <SectionHeading
          id="articles-title"
          eyebrow={dict.articles.eyebrow}
          title={dict.articles.title}
          subtitle={dict.articles.subtitle}
        />
        <div className="mt-12">
          <ArticleExplorer initialPages={pages} mode="preview" />
        </div>
      </Container>
    </section>
  );
}
