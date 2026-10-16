# Setup guide

Everything EarthSide needs outside the code, step by step. All services have a free tier.

| Service                                                                     | Required?                | Used for                                   |
| --------------------------------------------------------------------------- | ------------------------ | ------------------------------------------ |
| [Firebase](https://console.firebase.google.com) — **two projects**          | Yes                      | Database, author sign-in                   |
| [Cloudinary](https://cloudinary.com)                                        | Yes, for image uploads   | Cover and in-article images                |
| [Vercel](https://vercel.com) + [GitHub](https://github.com)                 | Yes, to go live          | Hosting, preview deployments, analytics    |
| [Resend](https://resend.com)                                                | Optional                 | Email when a reader requests a topic       |
| [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) | Optional                 | Anti-spam on the request form              |

---

## 1. Environments at a glance

| Environment     | Firebase project               | Where the variables live                                  | `NEXT_PUBLIC_APP_ENV` |
| --------------- | ------------------------------ | --------------------------------------------------------- | --------------------- |
| **Development** | dev project (e.g. `earthside-dev`) | `.env.development.local`                              | `development`         |
| **Preview**     | dev project                    | Vercel → Settings → Environment Variables → _Preview_     | `preview`             |
| **Production**  | live project (`earthside-3ed47`) | Vercel → … → _Production_, and `.env.production.local` | `production`          |

Local experiments and preview deployments write to the **dev** project; only the production site
touches live data. The dashboard shows the active database in a strip at the top, and turns it red
if a local build is ever pointed at production.

## 2. Firebase

Do this **twice** — once for the live project, once for the dev project.

1. **Create the project** — Firebase Console → _Add project_ (Google Analytics is not needed).
2. **Add members** — ⚙️ _Project settings → Users and permissions → Add member_ — invite the
   other team accounts (e.g. `earthside.contact@gmail.com` as _Owner_).
3. **Register a web app** — _Project settings → General → Your apps → `</>`_. Copy the config
   values into the matching `NEXT_PUBLIC_FIREBASE_*` variables. (`measurementId` isn't needed.)
4. **Enable Google sign-in** — _Build → Authentication → Sign-in method → Google → Enable_. Pick
   `earthside.contact@gmail.com` as the public support email.
5. **Create Firestore** — _Build → Firestore Database → Create database_, production mode, a
   nearby region (e.g. `asia-southeast2`, Jakarta).
6. **Authorized domains** — _Authentication → Settings → Authorized domains_. `localhost` is there
   by default. Add your LAN IP (e.g. `192.168.1.20`) to sign in from a phone on the same Wi-Fi,
   and the Vercel domain(s) for the project that serves them.
7. **Deploy the security rules & indexes** from the repo:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add            # pick the dev project, name the alias "development"
   npm run firebase:deploy:dev   # dev project
   npm run firebase:deploy:prod  # live project (alias "production" is already in .firebaserc)
   ```

   Re-run these whenever `firestore.rules` or `firestore.indexes.json` changes.

### Who can sign in to the dashboard

The dashboard is limited to an allow-list of Google accounts. Keep it identical in **all three**
places, then redeploy the rules:

- `NEXT_PUBLIC_ADMIN_EMAILS` (env files and Vercel)
- `firestore.rules` → `isAdmin()`
- `storage.rules` → `isAdmin()` (only if you use Firebase Storage)

The database rules are the real security boundary — the UI only hides the dashboard.

Public-facing email is a separate thing: contact details, request notifications and replies to
readers always use `earthside.contact@gmail.com` (`src/config/site.ts`), whoever is signed in.

## 3. Cloudinary

1. Copy the **Cloud name** from the dashboard → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
2. ⚙️ _Settings → Upload → Upload presets → Add upload preset_:
   - **Signing mode: Unsigned**, name it e.g. `earthside_unsigned` → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - Leave _Folder_ empty — the app files uploads under `earthside/<environment>/…`
   - Recommended: _Allowed formats_ `jpg, png, webp, gif`, _Max file size_ 5 MB
3. One Cloudinary account can serve every environment; the folders keep them apart.

> Prefer Firebase Storage? Set `NEXT_PUBLIC_IMAGE_PROVIDER=firebase`. New projects need the
> **Blaze** plan for Storage. Deploy `storage.rules` with `firebase deploy --only storage`.

## 4. Vercel

1. Push the repository to GitHub and import it in Vercel (_Add New → Project_).
2. Add the environment variables (_Settings → Environment Variables_):
   - **Production** → the live project's values, `NEXT_PUBLIC_APP_ENV=production`,
     `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
   - **Preview** → the dev project's values, `NEXT_PUBLIC_APP_ENV=preview`
   - Mark the two secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) as **Sensitive**.
3. **Redeploy** after changing any `NEXT_PUBLIC_*` value — they're baked in at build time.
4. _Analytics → Enable_ for page-view statistics.
5. Add the production domain to the live Firebase project's _Authorized domains_.

## 5. Resend — request notifications (optional)

1. Sign up **with `earthside.contact@gmail.com`**: without a custom domain, Resend can only
   deliver to the account's own address.
2. _API Keys → Create API key_ (sending access) → `RESEND_API_KEY`.
3. Keep `RESEND_FROM=EarthSide <onboarding@resend.dev>` until you verify a domain.

Leaving the key empty simply turns notifications off; requests still arrive in the dashboard.

## 6. Cloudflare Turnstile — anti-spam (optional)

1. Cloudflare dashboard → _Turnstile → Add widget_, mode **Managed**.
2. Add your domains (and `localhost` for local testing).
3. Site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, secret key → `TURNSTILE_SECRET_KEY`.

Without it, the form is still protected by a honeypot field and a limit of 5 requests per 10
minutes per IP address.

---

## Environment variable reference

| Variable                                 | Kind          | Notes                                            |
| ---------------------------------------- | ------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_APP_ENV`                    | config        | `development` · `preview` · `production`         |
| `NEXT_PUBLIC_SITE_URL`                   | config        | Absolute URL, used for SEO and the sitemap       |
| `NEXT_PUBLIC_FIREBASE_*` (6 values)      | public config | Safe in the browser; access is guarded by rules  |
| `NEXT_PUBLIC_ADMIN_EMAILS`               | config        | Comma separated; mirror it in the rules          |
| `NEXT_PUBLIC_IMAGE_PROVIDER`             | config        | `cloudinary` (default) or `firebase`             |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`      | public config |                                                  |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`   | public config | Must be an **unsigned** preset                   |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`         | public config |                                                  |
| `REQUEST_NOTIFY_EMAIL`, `RESEND_FROM`    | config        | Server only                                      |
| `RESEND_API_KEY`                         | 🔒 secret     | Server only — never prefix with `NEXT_PUBLIC_`   |
| `TURNSTILE_SECRET_KEY`                   | 🔒 secret     | Server only                                      |

Everything prefixed `NEXT_PUBLIC_` is shipped to the browser, so it can never be secret.

## Troubleshooting

| Symptom                                            | Fix                                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| _"Missing or insufficient permissions"_ on save    | The account isn't in `firestore.rules` → add it and run `npm run firebase:deploy:<env>`   |
| Google popup says the domain isn't authorized      | Add the domain/IP under _Authentication → Settings → Authorized domains_                  |
| _"Upload preset not found"_                        | Create the preset in Cloudinary with the exact name, signing mode **Unsigned**            |
| Site opened via a LAN IP looks blank in dev        | Use the _Network_ URL printed by `npm run dev`; LAN origins are allowed in `next.config.ts` |
| Env change has no effect on Vercel                 | Redeploy — `NEXT_PUBLIC_*` values are read at build time                                  |
