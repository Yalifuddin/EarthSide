# Architecture

EarthSide is a Next.js 16 app organised in layers. The rule of thumb: **business logic never
imports a framework or vendor SDK** — it talks to small interfaces ("ports"), and concrete
implementations ("adapters") are plugged in at a single composition root.

```
             ┌──────────────────────────────────────────┐
  app/ ────▶ │ components/ (React UI, grouped by feature)│
             └───────────────┬──────────────────────────┘
                             │ calls
             ┌───────────────▼───────────┐     ┌──────────────────┐
             │ server/  cached queries,  │     │ composition/     │
             │          server actions   │◀────│ wires services   │
             └───────────────┬───────────┘     │ to adapters      │
                             │ uses            └────────┬─────────┘
             ┌───────────────▼───────────┐              │ chooses
             │ core/   entities, Zod     │     ┌────────▼─────────┐
             │ validation, use cases,    │◀────│ infrastructure/  │
             │ ports (interfaces)        │impl.│ Firebase, Cloud- │
             └───────────────────────────┘     │ inary, Resend…   │
                                               └──────────────────┘
```

## Layers

| Folder            | Responsibility                                                                 | May import                   |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| `core/`           | Entities, validation, use cases (`*Service`), ports, pure helpers               | only `core/` and Zod         |
| `infrastructure/` | Adapters that implement ports: Firestore, Auth, Cloudinary, Resend, Turnstile, demo | `core/`, vendor SDKs     |
| `composition/`    | Builds services with the right adapters for the current environment            | everything above             |
| `server/`         | Next.js read models (`"use cache"` + tags) and server actions                  | `composition/`, `core/`      |
| `components/`     | UI, grouped by feature (`landing/`, `articles/`, `about/`, `admin/`, `layout/`, `ui/`) | `server/`, `composition/`, `core/` |
| `app/`            | Routes, layouts and metadata only — thin wrappers around components            | `components/`, `server/`     |

## SOLID in practice

- **Single responsibility** — `ArticleQueryService` serves readers, `ArticleAdminService`
  serves the author; components are small and focused.
- **Open/closed** — new behaviour arrives as a new adapter, not an edit: image uploaders,
  notifiers and spam verifiers are all swappable. Editor toolbar buttons are a declarative list.
- **Liskov** — the in-memory and Firestore repositories are interchangeable (demo mode and tests
  run on the former).
- **Interface segregation** — `ArticleReader` vs `ArticleWriter`, `TopicRequestSubmitter` vs
  `TopicRequestInbox`: public pages simply have no way to write.
- **Dependency inversion** — services depend on ports; decorators such as
  `ValidatingImageUploader` and `BestEffortNotifier` add behaviour without touching them.

## Data flow

**Reading.** Public pages call cached functions in `server/article-queries.ts`. Results are
shared across visitors and tagged; when the author saves, the `refreshPublishedContent` server
action expires the tag so the next visit is fresh — no polling, minimal Firestore reads.

**Writing.** The dashboard runs in the browser. Google sign-in gives Firebase a token, Firestore
Lite sends it with every request, and `firestore.rules` decides. In demo mode the dashboard
talks to the server's in-memory store through `server/demo-store.ts`, so public pages reflect
edits exactly like they would with Firebase.

**Rendering articles.** Bodies are stored as Tiptap JSON. On the server they're sanitised (unsafe
links and images removed), headings get anchor ids for the table of contents, and the JSON is
rendered to HTML with the **same extensions the editor uses** (`lib/rich-text/extensions.ts`).

**Translations.** An article is written in one language and has one translation into the
other. Saving an original whose text changed asks the `translateArticle` server action for a
machine draft — it verifies the author's Firebase ID token first, so nobody else can spend the
DeepL quota. Bodies are split into per-block segments with formatting kept as simple XML tags
(`core/rich-text/translatable-text.ts`), so headings, bold text and links survive. The draft
waits for review; readers see the last **reviewed** version (or the original if there's none),
picked by `localizeSummary` / `localizeArticle` for the reader's locale.

**Real 404s.** Once a page starts streaming its status is fixed at 200, so `proxy.ts` checks
article slugs first (against a short-lived cache of published slugs, with a direct lookup on a
miss) and rewrites unknown ones to a static page that answers 404.

**Environments.** `NEXT_PUBLIC_APP_ENV` plus a separate Firebase project per environment keep
experiments away from live data; `composition/data-environment.ts` tells the UI which database
is active.

## Conventions

- File names are `kebab-case`; one main export per file; tests sit next to the code (`*.test.ts`).
- Imports are ordered automatically (packages → `@/…` aliases → relative) by ESLint.
- Every user-facing string lives in `i18n/dictionaries/{id,en}.ts`; validation returns codes that
  the UI translates.
- Values from `"use client"` modules must not be imported into Server Components unless they are
  components — put shared constants in `core/` or `lib/`.
- Rich-text JSON leaving the editor goes through `readDocument()` (ProseMirror uses null-prototype
  objects that React can't send to server actions).
