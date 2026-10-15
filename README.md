# EarthSide 🌍

> Cerita kecil tentang rumah kita yang besar.

EarthSide adalah ruang baca tentang isu lingkungan nasional dan internasional, untuk semua umur
dengan fokus ke anak muda. Pembaca cuma membaca (tanpa like/komentar). Hanya **Della** yang bisa
menulis artikel, lewat dashboard admin.

| Section           | Isi                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1 · Hero          | Logo besar + judul, **setengah bumi interaktif** (klik → _About us_), preview 3 berita terbaru (1 besar + 2 kartu lengkung) |
| 2 · Artikel       | Kumpulan artikel Della, filter **Nasional / Internasional**, link ke arsip lengkap                                          |
| 3 · Request topik | Form email + topik + deskripsi singkat → masuk ke dashboard Della (+ email notifikasi, opsional)                            |
| 4 · Kontak        | `earthside.contact@gmail.com` (kirim email / salin alamat)                                                                  |

**Untuk pembaca:** dua bahasa (ID/EN), link _Tentang_ di navbar & footer, pencarian artikel,
penanda bahasa artikel, daftar isi otomatis, _reading progress bar_, artikel terkait dari kategori
yang sama, tombol kembali ke atas, placeholder untuk artikel tanpa gambar (atau gambar yang rusak),
dan animasi yang menghormati setelan _reduce motion_.

**Untuk Della:** editor rich text, pilihan kategori & bahasa artikel, pratinjau sebelum terbit,
autosave draf di browser, badge jumlah request baru, dan email notifikasi request.

**Teknis:** SEO (`sitemap.xml`, `robots.txt`, gambar preview saat link dibagikan), status 404 yang
benar, anti-spam berlapis (honeypot, rate limit, Cloudflare Turnstile), dan Vercel Analytics.

---

## ✅ Checklist langkah eksternal

Semua akun di bawah **gratis**. Sebaiknya daftar memakai `earthside.contact@gmail.com` supaya semua
ada di satu akun Della.

| #   | Layanan                                                                     | Wajib?                          | Untuk apa                                      |
| --- | --------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------- |
| 1   | [GitHub](https://github.com)                                                | Wajib                           | Menyimpan kode, dihubungkan ke Vercel          |
| 2   | [Firebase](https://console.firebase.google.com)                             | Wajib                           | Database artikel & request, login Google Della |
| 3   | [Cloudinary](https://cloudinary.com)                                        | Wajib (kalau mau upload gambar) | Menyimpan gambar sampul & gambar artikel       |
| 4   | [Vercel](https://vercel.com)                                                | Wajib                           | Hosting website + statistik pengunjung         |
| 5   | [Resend](https://resend.com)                                                | Opsional                        | Email ke Della tiap ada request baru           |
| 6   | [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) | Opsional                        | Anti-spam di form request                      |

Langkah detailnya ada di bawah. Semua kunci disalin ke `.env.local` (lokal) dan ke
_Environment Variables_ di Vercel (produksi). Lihat `.env.example` untuk daftar lengkapnya.

---

## Keputusan admin: halaman `/admin` + whitelist akun Google

Pembaca **tidak perlu login sama sekali**, karena mereka hanya membaca. Admin masuk lewat
`/id/admin` dengan tombol _Masuk dengan Google_, dan hanya email yang terdaftar yang diizinkan.

- Halaman publik tetap ringan: kode login/editor tidak ikut ter-download oleh pembaca.
- Keamanan sesungguhnya ada di **Firestore Security Rules** (`firestore.rules`), jadi walaupun
  seseorang membuka `/admin`, database tetap menolak tulisan dari akun yang tidak terdaftar.

### Email: mana yang boleh dua akun, mana yang hanya akun resmi

| Kegunaan                                                      | `earthside.contact@gmail.com` | `yalif1710@gmail.com` | Diatur di                                                      |
| ------------------------------------------------------------- | :---------------------------: | :-------------------: | -------------------------------------------------------------- |
| Login dashboard `/admin` (tulis, edit, hapus, kelola request) |              ✅               |          ✅           | `NEXT_PUBLIC_ADMIN_EMAILS`, `firestore.rules`, `storage.rules` |
| Kontak yang tampil di website                                 |              ✅               |          ❌           | `src/config/site.ts` → `contactEmail`                          |
| Penerima email notifikasi request baru                        |              ✅               |          ❌           | `REQUEST_NOTIFY_EMAIL`                                         |
| Pengirim balasan ke pembaca (tombol _Balas via email_)        |              ✅               |          ❌           | otomatis membuka Gmail akun `contactEmail`                     |
| Pemilik akun Firebase, Vercel, Cloudinary, Resend, Turnstile  |              ✅               |  ➕ sebagai anggota   | lihat di bawah                                                 |

Menambah/menghapus admin = ubah **ketiga** tempat di baris pertama (lalu `firebase deploy --only firestore`).

Supaya `yalif1710@gmail.com` ikut bisa membuka _console_ layanan (opsional):

- **Firebase:** Project settings → _Users and permissions_ → **Add member** → role _Editor_.
- **GitHub:** repo → Settings → _Collaborators_ → **Add people**.
- **Cloudinary:** Settings → _Users_ → **Invite user** (paket gratis punya kuota user terbatas).
- **Vercel:** paket gratis (Hobby) hanya satu anggota. Cukup jadikan collaborator di GitHub;
  setiap _push_ ke repo tetap otomatis ter-deploy.
- **Resend:** tetap satu akun `earthside.contact@gmail.com` saja (tanpa domain sendiri, Resend
  hanya bisa mengirim ke email pemilik akun).

---

## Menjalankan secara lokal

Butuh Node.js 20.19+ (disarankan 22 atau 24).

```bash
npm install
cp .env.example .env.local   # isi nanti; boleh dibiarkan kosong untuk mode demo
npm run dev
```

Buka http://localhost:3000. Tanpa konfigurasi Firebase, situs berjalan dalam **mode demo**: ada
artikel contoh, dan `/id/admin` bisa dicoba dengan login palsu. Perubahan di dashboard demo
langsung tampil di halaman publik, tapi tersimpan di memori server (hilang saat `npm run dev`
dijalankan ulang). Login demo **hanya aktif saat development**.

**Membuka dari HP/laptop lain di Wi-Fi yang sama:** pakai alamat _Network_ yang muncul di terminal
(mis. `http://192.168.x.x:3000`). Alamat jaringan lokal sudah diizinkan di `next.config.ts`. Untuk
login Google lewat alamat itu (setelah Firebase aktif), tambahkan IP-nya di _Firebase →
Authentication → Settings → Authorized domains_.

| Script                        | Kegunaan                               |
| ----------------------------- | -------------------------------------- |
| `npm run dev`                 | Server development                     |
| `npm run build` / `npm start` | Build & jalankan versi production      |
| `npm test`                    | Unit test (Vitest) untuk logika domain |
| `npm run lint`                | ESLint                                 |
| `npm run typecheck`           | Generate tipe route + cek TypeScript   |
| `npm run format`              | Rapikan kode dengan Prettier           |

---

## 1 · Firebase (wajib)

1. Buka [Firebase Console](https://console.firebase.google.com) → **Add project** → beri nama
   (mis. `earthside`). Google Analytics boleh dimatikan.
2. **Project settings → General → Your apps → ikon `</>` (Web)** → daftarkan app, lalu salin
   nilai `firebaseConfig` ke variabel `NEXT_PUBLIC_FIREBASE_*` di `.env.local`.
3. **Build → Authentication → Get started → Sign-in method → Google → Enable**, pilih email
   dukungan, simpan.
4. **Build → Firestore Database → Create database** → pilih lokasi (mis. `asia-southeast2`
   Jakarta) → mulai di **production mode**.
5. Email admin sudah diset ke `earthside.contact@gmail.com` dan `yalif1710@gmail.com` di
   `firestore.rules`, `storage.rules`, dan `.env.example` (lihat tabel email di atas).
6. Deploy rules & index dari terminal:

   ```bash
   npm install -g firebase-tools
   firebase login                 # login dengan akun pemilik project
   firebase use --add             # pilih project tadi
   firebase deploy --only firestore
   ```

7. Setelah deploy ke Vercel (langkah 4): **Authentication → Settings → Authorized domains → Add
   domain**, lalu masukkan domain Vercel-mu (mis. `earthside.vercel.app`).

## 2 · Cloudinary (upload gambar)

1. Daftar di [cloudinary.com](https://cloudinary.com). **Cloud name** ada di Dashboard → isi
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
2. **Settings (ikon gerigi) → Upload → Upload presets → Add upload preset** → _Signing mode:_
   **Unsigned**, simpan. Nama preset → isi `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

> Alternatif: `NEXT_PUBLIC_IMAGE_PROVIDER=firebase` memakai Firebase Storage. Untuk project baru,
> Storage butuh paket **Blaze** (ada kuota gratis, tapi perlu kartu). Deploy rule-nya dengan
> `firebase deploy --only storage`.

## 3 · Resend: email notifikasi request (opsional)

1. Daftar di [resend.com](https://resend.com) **dengan `earthside.contact@gmail.com`**.
2. **API Keys → Create API Key** (permission: _Sending access_) → isi `RESEND_API_KEY`.
3. Biarkan `RESEND_FROM=EarthSide <onboarding@resend.dev>`. Tanpa domain sendiri, Resend hanya
   bisa mengirim ke email yang dipakai mendaftar, dan itu memang tujuan kita.
   Kalau nanti punya domain (mis. `earthside.id`), verifikasi di _Domains_ lalu ganti `RESEND_FROM`.

Email notifikasi berisi topik & deskripsi, dan tombol _Reply_-nya langsung ke email pembaca.
Kalau kunci kosong, fitur ini mati dengan sendirinya (request tetap masuk dashboard).

## 4 · Vercel: hosting & statistik

1. Push repo ini ke GitHub.
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → import repo.
3. Sebelum _Deploy_, buka **Environment Variables** dan isi semua nilai dari `.env.local`.
   Set `NEXT_PUBLIC_SITE_URL` ke URL produksi (mis. `https://earthside.vercel.app`).
4. Setelah deploy: **Project → Analytics → Enable** (gratis untuk paket Hobby). Statistik halaman
   paling banyak dibaca akan muncul di sana.
5. Jangan lupa langkah 1.7 (Authorized domains di Firebase).

## 5 · Cloudflare Turnstile: anti-spam (opsional)

1. Daftar/masuk di [Cloudflare](https://dash.cloudflare.com) → **Turnstile → Add widget**.
2. Isi nama, tambahkan domain (`earthside.vercel.app`, dan `localhost` untuk uji lokal), mode
   **Managed**.
3. Salin **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan **Secret Key** → `TURNSTILE_SECRET_KEY`.

Tanpa Turnstile, form tetap dilindungi honeypot dan batas 5 request per 10 menit per alamat IP.

---

## Arsitektur

Kode disusun berlapis (_clean architecture_). Ketergantungan hanya mengarah **ke dalam**:
UI → service (use case) → interface. Implementasi Firebase dkk. dipasang dari luar.

```
src/
├── core/                 ← Domain & use case. Murni TypeScript, tidak kenal Next.js/Firebase.
│   ├── articles/         entity, validasi (zod), port repository, query/admin service, pencarian
│   ├── topic-requests/   entity, validasi, port, service submit & inbox, port notifier
│   ├── spam/             SpamGuard: honeypot + rate limiter + port HumanVerifier
│   ├── auth/             port AuthGateway + AdminPolicy (whitelist email)
│   ├── media/            port ImageUploader + decorator validasi file
│   ├── rich-text/        tipe dokumen + util (teks polos, excerpt, waktu baca, sanitasi, anchor heading)
│   └── shared/           validasi, slug, pagination
├── infrastructure/       ← Adapter yang mengimplementasikan port di core
│   ├── firebase/         Firestore (Lite), Auth Google, Storage
│   ├── cloudinary/       uploader gambar
│   ├── resend/           email notifikasi request
│   ├── cloudflare/       verifikasi Turnstile
│   └── demo/             repository in-memory + data contoh (mode demo & test)
├── composition/          ← Composition root: satu-satunya tempat memilih implementasi
├── server/               ← Query ber-cache ("use cache"), server actions, registry slug untuk Proxy
├── i18n/                 ← Kamus id/en, provider, format tanggal
├── lib/                  ← Helper UI (routes, ekstensi Tiptap bersama, renderer HTML)
├── components/           ← UI: ui/ (primitif), layout/, landing/, articles/, admin/
├── proxy.ts              ← Redirect bahasa + status 404 untuk artikel yang tidak ada
└── app/[lang]/           ← Route: (site)/ untuk publik, admin/ untuk dashboard
```

Contoh penerapan SOLID:

- **S**: tiap service punya satu tanggung jawab (`ArticleQueryService` untuk pembaca,
  `ArticleAdminService` untuk penulis); komponen UI kecil dan fokus.
- **O**: fitur baru masuk lewat implementasi baru, bukan mengubah yang lama: uploader gambar,
  notifier email, verifier anti-spam. Tombol toolbar editor berupa daftar deklaratif.
- **L**: repository in-memory dan Firestore bisa saling menggantikan (dipakai di demo & test).
- **I**: port dipisah (`ArticleReader` vs `ArticleWriter`, `TopicRequestSubmitter` vs
  `TopicRequestInbox`), jadi halaman publik tidak punya akses menulis.
- **D**: service bergantung pada interface; implementasi konkret disuntikkan di `composition/`.
  Decorator (`ValidatingImageUploader`, `BestEffortNotifier`) menambah perilaku tanpa mengubah kelas.

Alur data:

- **Halaman publik** membaca artikel di server lewat fungsi ber-`"use cache"`. Setiap kali Della
  menyimpan, server action `refreshPublishedContent` meng-_expire_ cache, jadi artikel baru langsung
  tampil tanpa membebani Firestore.
- **Dashboard** berjalan di browser: login Google → token otomatis dikirim ke Firestore → rules
  memastikan hanya admin yang bisa menulis.
- **Proxy** mengecek slug artikel ke daftar artikel terbit (di-cache 1 menit). Slug yang tidak
  ada diarahkan ke halaman 404 statis, sehingga status HTTP-nya benar-benar 404.
- Isi artikel disimpan sebagai JSON Tiptap, lalu dirender menjadi HTML di server memakai ekstensi
  yang sama dengan editor, setelah URL berbahaya dibersihkan.

---

## Catatan & batasan

- Pencarian berjalan di memori atas daftar artikel terbit (maks. 500). Cukup untuk blog pribadi;
  kalau arsip sudah ribuan artikel, ganti ke layanan pencarian seperti Algolia.
- Rate limit request disimpan per server instance; cukup untuk penyalahgunaan ringan.
- Autosave draf disimpan di browser yang dipakai Della (bukan di database).
- Menghapus artikel tidak menghapus gambarnya di Cloudinary (upload _unsigned_ tidak bisa
  menghapus). Bersihkan manual di Media Library kalau perlu.
- Teks _About us_ ada di `src/i18n/dictionaries/{id,en}.ts`; kontak & nama penulis di
  `src/config/site.ts`.
- Bahan desain asli (logo, moodboard, sketsa) ada di `docs/design/`.
