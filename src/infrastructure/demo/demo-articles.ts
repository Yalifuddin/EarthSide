import type { Article, ArticleCategory } from "@/core/articles/article";
import { fingerprintOf, toTranslatedArticle } from "@/core/articles/article-translation";
import {
  buildExcerpt,
  estimateReadingMinutes,
  extractPlainText,
  type RichTextNode,
} from "@/core/rich-text/rich-text";

/*
 * Sample content shown only while Firebase is not configured, so the site can
 * be previewed right after cloning. These are illustrative placeholders, not
 * real reporting — they disappear as soon as a real database is connected.
 */

const text = (value: string): RichTextNode => ({ type: "text", text: value });
const p = (value: string): RichTextNode => ({ type: "paragraph", content: [text(value)] });
const h2 = (value: string): RichTextNode => ({
  type: "heading",
  attrs: { level: 2 },
  content: [text(value)],
});
const quote = (value: string): RichTextNode => ({ type: "blockquote", content: [p(value)] });
const list = (items: string[]): RichTextNode => ({
  type: "bulletList",
  content: items.map((item) => ({ type: "listItem", content: [p(item)] })),
});
const doc = (...content: RichTextNode[]): RichTextNode => ({ type: "doc", content });

interface DemoSeed {
  slug: string;
  title: string;
  category: ArticleCategory;
  cover: string;
  daysAgo: number;
  content: RichTextNode;
  /** A reviewed English version, to show bilingual articles in demo mode. */
  english?: { title: string; content: RichTextNode };
}

const seeds: DemoSeed[] = [
  {
    slug: "kenapa-mangrove-penting-buat-pesisir-kita",
    title: "Kenapa Mangrove Penting Buat Pesisir Kita?",
    category: "national",
    cover: "/demo/mangrove.svg",
    daysAgo: 1,
    english: {
      title: "Why Do Mangroves Matter for Our Coasts?",
      content: doc(
        p(
          "Mangroves are often dismissed as shrubs along the shore, yet these forests are one of the toughest natural defences Indonesia's coastline has. Their dense roots soften waves, hold mud in place, and are home to small fish, crabs and birds.",
        ),
        p(
          "Mangroves also store large amounts of carbon in the soil they grow in. Protecting them means helping to slow down climate change, too.",
        ),
        h2("Why are mangroves disappearing?"),
        p(
          "Fish ponds, coastal construction and rubbish caught in the roots have shrunk many mangrove areas. Once they are gone, it takes years for them to grow back.",
        ),
        h2("What can we do?"),
        list([
          "Join a mangrove planting day with a local community.",
          "Choose coastal trips that don't damage mangrove areas.",
          "Share this with your friends!",
        ]),
        quote("Sample article — this content only appears in demo mode."),
      ),
    },
    content: doc(
      p(
        "Mangrove sering dianggap cuma semak di pinggir pantai, padahal hutan ini adalah salah satu pelindung alami paling tangguh yang dimiliki garis pantai Indonesia. Akarnya yang rapat meredam ombak, menahan lumpur, dan jadi rumah bagi ikan kecil, kepiting, dan burung.",
      ),
      p(
        "Selain itu, mangrove mampu menyimpan karbon dalam jumlah besar di tanah tempat ia tumbuh. Artinya, menjaga mangrove juga berarti ikut menahan laju perubahan iklim.",
      ),
      h2("Kenapa mangrove bisa berkurang?"),
      p(
        "Pembukaan tambak, pembangunan di pesisir, dan sampah yang tersangkut di akar membuat banyak kawasan mangrove menyusut. Begitu hilang, butuh waktu bertahun-tahun untuk tumbuh kembali.",
      ),
      h2("Apa yang bisa kita lakukan?"),
      list([
        "Ikut kegiatan tanam mangrove bareng komunitas lokal.",
        "Pilih wisata pesisir yang tidak merusak kawasan mangrove.",
        "Bagikan informasi ini ke teman-temanmu!",
      ]),
      quote("Contoh artikel — konten ini hanya tampil di mode demo."),
    ),
  },
  {
    slug: "krisis-iklim-dalam-lima-menit",
    title: "Krisis Iklim dalam 5 Menit: Penjelasan Paling Simpel",
    category: "international",
    cover: "/demo/climate.svg",
    daysAgo: 3,
    english: {
      title: "The Climate Crisis in 5 Minutes: The Simplest Explanation",
      content: doc(
        p(
          "Our Earth is wrapped in a layer of gases that keeps it at a comfortable temperature. The problem is that human activities such as burning coal, oil and gas thicken that blanket, trapping more of the sun's heat.",
        ),
        p(
          "The result is rising average temperatures, weather that is harder to predict, and melting polar ice. This isn't one country's problem — it's a challenge for the whole world.",
        ),
        h2("What does it mean for us?"),
        p(
          "Less predictable seasons can affect harvests, access to clean water and the risk of floods in cities. The impact reaches our everyday lives.",
        ),
        h2("Why should young people care?"),
        p(
          "Because our generation will live with the impact the longest — and also has the biggest chance to change how the story ends.",
        ),
        quote("Sample article — this content only appears in demo mode."),
      ),
    },
    content: doc(
      p(
        "Bumi kita diselimuti lapisan gas yang menjaga suhunya tetap nyaman. Masalahnya, aktivitas manusia seperti membakar batu bara, minyak, dan gas menambah tebal selimut itu, sehingga panas matahari terperangkap lebih banyak.",
      ),
      p(
        "Hasilnya adalah suhu rata-rata yang terus naik, cuaca yang makin sulit ditebak, dan es di kutub yang mencair. Ini bukan masalah satu negara saja, melainkan tantangan bersama seluruh dunia.",
      ),
      h2("Apa dampaknya buat kita?"),
      p(
        "Musim yang makin sulit ditebak bisa memengaruhi panen, ketersediaan air bersih, hingga risiko banjir di kota. Dampaknya terasa sampai ke kehidupan sehari-hari.",
      ),
      h2("Kenapa anak muda perlu peduli?"),
      p(
        "Karena generasi kita yang akan hidup paling lama dengan dampaknya — dan juga punya kesempatan paling besar untuk mengubah arah ceritanya.",
      ),
      quote("Contoh artikel — konten ini hanya tampil di mode demo."),
    ),
  },
  {
    slug: "sampah-plastik-di-laut-dari-mana-asalnya",
    title: "Sampah Plastik di Laut: Dari Mana Asalnya?",
    category: "national",
    cover: "/demo/ocean.svg",
    daysAgo: 6,
    content: doc(
      p(
        "Botol, sedotan, dan kantong plastik yang kita buang sembarangan bisa terbawa hujan ke selokan, lalu ke sungai, dan akhirnya ke laut. Di sana plastik tidak benar-benar hilang — ia hanya pecah menjadi potongan yang makin kecil.",
      ),
      p(
        "Potongan kecil inilah yang disebut mikroplastik, dan bisa termakan oleh ikan maupun hewan laut lainnya.",
      ),
      h2("Mulai dari langkah kecil"),
      list([
        "Bawa botol minum sendiri.",
        "Tolak sedotan kalau tidak perlu.",
        "Pilah sampah di rumah.",
      ]),
      quote("Contoh artikel — konten ini hanya tampil di mode demo."),
    ),
  },
  {
    slug: "hutan-hujan-paru-paru-yang-sedang-sesak",
    title: "Hutan Hujan: Paru-Paru Dunia yang Sedang Sesak Napas",
    category: "international",
    cover: "/demo/forest.svg",
    daysAgo: 9,
    content: doc(
      p(
        "Hutan hujan tropis tersebar di Amerika Selatan, Afrika Tengah, hingga Asia Tenggara. Mereka menjadi rumah bagi sebagian besar keanekaragaman hayati di darat dan membantu mengatur iklim global.",
      ),
      p(
        "Pembukaan lahan untuk perkebunan, tambang, dan permukiman membuat luas hutan terus berkurang. Kabar baiknya, banyak komunitas adat dan anak muda di berbagai negara yang bergerak menjaga hutan mereka.",
      ),
      quote("Contoh artikel — konten ini hanya tampil di mode demo."),
    ),
  },
  {
    slug: "panduan-zero-waste-untuk-pemula",
    title: "Panduan Zero Waste untuk Pemula (Tanpa Ribet)",
    category: "national",
    cover: "/demo/zero-waste.svg",
    daysAgo: 12,
    content: doc(
      p(
        "Zero waste bukan berarti kamu harus langsung hidup tanpa sampah sama sekali. Intinya adalah mengurangi sampah sedikit demi sedikit dengan cara yang realistis.",
      ),
      h2("Tiga langkah pertama"),
      list([
        "Refuse — tolak barang sekali pakai yang tidak kamu butuhkan.",
        "Reuse — pakai ulang barang yang masih layak.",
        "Recycle — daur ulang sisanya dengan benar.",
      ]),
      quote("Contoh artikel — konten ini hanya tampil di mode demo."),
    ),
  },
  {
    slug: "kenapa-lebah-penting-untuk-makanan-kita",
    title: "Kenapa Lebah Penting untuk Makanan Kita?",
    category: "international",
    cover: "/demo/bees.svg",
    daysAgo: 15,
    content: doc(
      p(
        "Banyak buah dan sayur yang kita makan bergantung pada penyerbukan oleh lebah dan serangga lain. Tanpa mereka, panen bisa berkurang drastis.",
      ),
      p(
        "Menanam bunga lokal di halaman atau balkon adalah cara sederhana untuk membantu para penyerbuk kecil ini.",
      ),
      quote("Contoh artikel — konten ini hanya tampil di mode demo."),
    ),
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function englishTranslation(seed: DemoSeed, sourceFingerprint: string, at: Date) {
  if (!seed.english) return {};
  const translated = toTranslatedArticle({ ...seed.english, coverImageAlt: seed.english.title });
  return {
    en: {
      published: translated,
      draft: translated,
      needsReview: false,
      sourceFingerprint,
      updatedAt: at,
    },
  };
}

export function createDemoArticles(now = new Date()): Article[] {
  return seeds.map((seed, index) => {
    const plainText = extractPlainText(seed.content);
    const publishedAt = new Date(now.getTime() - seed.daysAgo * DAY_MS);
    const textFingerprint = fingerprintOf({
      title: seed.title,
      content: seed.content,
      coverImageAlt: seed.title,
    });
    return {
      id: `demo-${index + 1}`,
      slug: seed.slug,
      title: seed.title,
      excerpt: buildExcerpt(plainText),
      content: seed.content,
      coverImageUrl: seed.cover,
      coverImageAlt: seed.title,
      category: seed.category,
      language: "id",
      status: "published",
      readingMinutes: estimateReadingMinutes(plainText),
      authorName: "Della",
      textFingerprint,
      translations: englishTranslation(seed, textFingerprint, publishedAt),
      createdAt: publishedAt,
      updatedAt: publishedAt,
      publishedAt,
    };
  });
}
