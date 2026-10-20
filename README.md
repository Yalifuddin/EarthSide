<div align="center">

<img src="docs/screenshots/banner.webp" alt="EarthSide — small stories about our big home" width="100%" />

# EarthSide 🌍

**Small stories about our big home.**

A bilingual reading space about environmental issues — from the river near your home to the ice at the poles —
written in plain, friendly language for young readers.

![Next.js](https://img.shields.io/badge/Next.js-16-0a3323?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-105666?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-366544?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-839958?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore_%2B_Auth-d3968c?logo=firebase&logoColor=white)
![Tests](https://img.shields.io/badge/tests-Vitest-a8655b?logo=vitest&logoColor=white)

[Features](#-features) · [Screenshots](#-screenshots) · [Quick start](#-quick-start) · [Architecture](#-architecture) · [Docs](#-documentation)

</div>

---

## 🌱 About

EarthSide is the personal publication of **Della**: a landing page and archive of articles about
**national 🇮🇩 and international 🌏 environmental issues**. It's built for everyone, with a
focus on teenagers and young adults — so the tone is light, the design is playful, and nothing
gets in the way of reading.

- **Readers just read.** No accounts, no likes, no comments — only stories (and a share button).
- **One author, one dashboard.** Articles are written in a private, Google-sign-in dashboard.
- **Readers still have a voice.** Anyone can suggest a topic for a future article.

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### For readers

- 🌍 **Interactive half globe** — tap it to open _About us_
- 📰 **Latest news** up front, the full **archive** with National / International filters
- 🔎 **Search**, **table of contents**, reading progress & reading time
- 🇮🇩 / 🇬🇧 **Fully bilingual** — articles follow the language the reader picks
- 💌 **Topic requests** with email, topic and a short description
- ♿ Accessible, responsive, and respectful of _reduced motion_

</td>
<td width="50%" valign="top">

### For the author

- ✍️ **Rich-text editor** with images, headings, quotes and links
- 🌐 **One-click translations** (DeepL) the author reviews before they go live
- 👀 **Preview** exactly what readers will see before publishing
- 💾 **Drafts & local autosave** — closing the tab doesn't lose work
- 📥 **Request inbox** with status, badges and one-click Gmail replies
- 🔔 Optional **email notifications** for new requests
- 🧪 **Separate dev & live data**, clearly labelled in the dashboard

</td>
</tr>
</table>

**Under the hood:** server-rendered and cached pages that refresh the moment an article is saved,
SEO (sitemap, robots, social preview image), real 404s, layered spam protection (honeypot, rate
limit, Cloudflare Turnstile), and page analytics.

## 📸 Screenshots

| Home                                                         | About us                                                         |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| ![Home page with the half globe](docs/screenshots/hero.webp) | ![About dialog](docs/screenshots/about.webp)                     |
| **Article collection**                                       | **Reading an article**                                           |
| ![Article grid](docs/screenshots/articles.webp)              | ![Article with table of contents](docs/screenshots/article.webp) |
| **Request a topic**                                          | **Author dashboard**                                             |
| ![Topic request form](docs/screenshots/request.webp)         | ![Dashboard](docs/screenshots/dashboard.webp)                    |

<p align="center">
  <img src="docs/screenshots/editor.webp" alt="Article editor" width="68%" />
  &nbsp;
  <img src="docs/screenshots/mobile.webp" alt="Mobile home page" width="22%" />
</p>

## 🧰 Tech stack

| Layer     | Choice                                                                      |
| --------- | --------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Cache Components, Proxy)      |
| UI        | React 19, Tailwind CSS 4, [Motion](https://motion.dev), Lucide icons        |
| Editor    | [Tiptap 3](https://tiptap.dev) (shared schema for editing and rendering)    |
| Data      | Firebase Firestore (Lite SDK) + security rules                              |
| Auth      | Firebase Authentication — Google sign-in, email allow-list                  |
| Media     | Cloudinary (unsigned uploads) or Firebase Storage                           |
| Extras    | DeepL (translation), Resend (email), Cloudflare Turnstile, Vercel Analytics |
| Quality   | TypeScript strict, Zod, Vitest, ESLint, Prettier                            |

## 🚀 Quick start

> Requires **Node.js 20.19+** (22 or 24 recommended).

```bash
git clone https://github.com/Yalifuddin/EarthSide.git
cd EarthSide
npm install
npm run dev
```

Open <http://localhost:3000>. With no configuration the site runs in **demo mode**: sample
articles are shown and `/en/admin` lets you try the dashboard with a fake sign-in (development only).

To connect real services, copy `.env.example` to `.env.development.local` and follow the
**[setup guide](docs/setup.md)**.

### Environments

Each environment has its **own Firebase project**, so experiments never reach the live site.

| Environment     | Runs with                       | Config file / place                                       | Data                       |
| --------------- | ------------------------------- | --------------------------------------------------------- | -------------------------- |
| **Development** | `npm run dev`                   | `.env.development.local`                                  | Dev project (or demo data) |
| **Preview**     | Vercel preview deployments      | Vercel → _Preview_ variables                              | Dev project                |
| **Production**  | Vercel production / `npm start` | Vercel → _Production_ variables · `.env.production.local` | Live project               |

The dashboard always shows which database you're editing — and warns loudly if a local build
is pointed at the live one.

### Scripts

| Command                        | What it does                                   |
| ------------------------------ | ---------------------------------------------- |
| `npm run dev`                  | Start the development server                   |
| `npm run build` / `npm start`  | Production build / serve it                    |
| `npm test`                     | Unit tests (domain logic)                      |
| `npm run lint` · `typecheck`   | ESLint · route types + TypeScript              |
| `npm run format`               | Format with Prettier                           |
| `npm run firebase:deploy:dev`  | Deploy Firestore rules & indexes to dev        |
| `npm run firebase:deploy:prod` | Deploy Firestore rules & indexes to production |

## 🏛 Architecture

The code follows a layered, _clean architecture_ style: dependencies only point inward, and
framework or vendor code is plugged in at the edges.

```mermaid
flowchart LR
  subgraph UI["app/ + components/ (Next.js, React)"]
    Pages[Pages & layouts]
    Dashboard[Admin dashboard]
  end
  subgraph Server["server/"]
    Queries["Cached queries<br/>'use cache' + tags"]
    Actions[Server actions]
  end
  subgraph Core["core/ — pure TypeScript"]
    Services[Use cases<br/>ArticleQueryService · ArticleAdminService<br/>TopicRequest services · SpamGuard]
    Ports[[Ports<br/>ArticleReader / Writer · ImageUploader<br/>AuthGateway · Notifier · HumanVerifier]]
  end
  subgraph Infra["infrastructure/ — adapters"]
    Firebase[(Firestore · Auth)]
    Cloudinary[(Cloudinary)]
    Resend[(Resend)]
    Demo[(In-memory demo)]
  end
  Composition{{composition/<br/>picks the adapters}}

  Pages --> Queries --> Services
  Pages --> Actions --> Services
  Dashboard --> Services
  Services --> Ports
  Composition -.wires.-> Services
  Composition -.chooses.-> Infra
  Infra -.implements.-> Ports
```

```
src/
├── app/[lang]/        Routes — (site)/ for readers, admin/ for the dashboard
├── components/        UI, grouped by feature: landing/ · articles/ · about/ · admin/ · layout/ · ui/
├── core/              Domain entities, validation, use cases and ports (no framework code)
├── infrastructure/    Firebase, Cloudinary, Resend, Turnstile and demo adapters
├── composition/       The only place that decides which adapters are used
├── server/            Cached read models, server actions, Proxy helpers
├── i18n/              Indonesian & English dictionaries, formatting
├── lib/ · hooks/      Small shared helpers
└── proxy.ts           Locale redirects and real 404s for unknown articles
```

Read more in **[docs/architecture.md](docs/architecture.md)**.

## 📚 Documentation

| Document                                     | For                                                         |
| -------------------------------------------- | ----------------------------------------------------------- |
| [docs/setup.md](docs/setup.md)               | Connecting Firebase, Cloudinary, Vercel and optional extras |
| [docs/architecture.md](docs/architecture.md) | How the code is organised, and why                          |
| [docs/design/](docs/design)                  | Original logo, moodboard and sketches                       |

## 💌 Contact

Questions, ideas or collaborations:

- ✉️ **[earthside.contact@gmail.com](mailto:earthside.contact@gmail.com)**
- 📸 Instagram **[@earthside.journal](https://www.instagram.com/earthside.journal)**

<div align="center">
<sub>Made with care for our planet 🌿 · © EarthSide</sub>
</div>
