# Deploy ke Vercel

Cara deploy repo ini ke Vercel, pakai **Turso/libSQL** untuk database.

Baca bagian ini dulu, karena salah langkah di sini bikin situsnya online
padahal database-nya kosong.

## Kenapa tidak SQLite biasa

Dulu repo ini pakai `provider = "sqlite"` + `better-sqlite3` dengan file
`dev.db`. Itu **tidak bisa jalan di Vercel**. Dari dokumentasi Vercel:

> SQLite needs a local file system on the server to store the data permanently
> when write requests are made. In a serverless environment, this central single
> permanent storage is not available because storage is ephemeral with serverless
> functions.

Artinya: SQLite butuh file system lokal di server untuk menyimpan data secara
permanen saat ada request tulis. Di environment serverless, penyimpanan pusat
semacam itu tidak ada, karena storage-nya sementara dan ikut mati bersama
instance.

Praktisnya: hanya `/tmp` yang bisa ditulis, tiap instance function tidak berbagi
storage satu sama lain, dan `dev.db` juga ada di `.gitignore` jadi tidak ikut
ter-deploy. Kalau dipaksa deploy begitu, `next build` tetap lolos dan situsnya
online, tapi setiap tulisan dari admin akan error
`attempt to write a readonly database` atau hilang begitu instance di-recycle.

**libSQL** adalah fork dari SQLite dengan dialect yang sama persis, tapi
datanya disimpan di server remote. Jadi schema, query, dan seluruh kode kamu
tidak berubah, cuma lokasi file-nya.

## Yang sudah disiapkan di repo

| File | Isi |
|---|---|
| `src/lib/db.ts` | Pakai `PrismaLibSql`. Satu `DATABASE_URL` buat dua keperluan: `file:./dev.db` lokal, `libsql://…` production. |
| `prisma/seed.ts`, `prisma/seed-extra.ts` | Adapter sama, jadi seed lokal jalan tanpa ubah apa pun. |
| `next.config.ts` | `serverExternalPackages: ["@libsql/client"]`, wajib karena native binding per-platform. |
| `scripts/devdb-to-turso.ts` | Salin `dev.db` lokal ke Turso. Upsert berdasarkan `id`, jadi aman dijalankan ulang. |
| `src/proxy.ts` | CSP nonce-based. Lihat `SECURITY-VERCEL.md`. |

`@prisma/adapter-better-sqlite3` dan `better-sqlite3` sudah dibuang.

## Prasyarat

- Akun Vercel dan repo ini sudah di-push ke GitHub.
- Node 20+ dan npm.
- Akun gratis di [turso.tech](https://turso.tech).

---

## Langkah 1: Buat database Turso

```bash
npx turso login
npx turso db create soalml
```

Outputnya memuat `DATABASE_URL`, bentuknya `libsql://soalml-xxxxx.turso.io`.

Buat token akses:

```bash
npx turso db tokens create
```

Simpan token itu. Ini yang jadi `DATABASE_AUTH_TOKEN`. Tanpa token, semua query
production akan 401.

## Langkah 2: Bikin tabel di Turso

**`prisma migrate deploy` belum didukung untuk Turso.** Yang didukung adalah
mengirim SQL langsung. Buat SQL-nya dari schema Prisma:

```bash
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > turso-init.sql
```

Lalu terapkan:

```bash
npx turso db shell soalml < turso-init.sql
```

Cek tabelnya sudah ada:

```bash
npx turso db shell soalml "select name from sqlite_master where type='table'"
```

Harus muncul `Question`.

## Langkah 3: Pindahkan data dari dev.db

`dev.db` lokal lu berisi 130 soal, termasuk yang lu edit manual lewat admin.
Seed file cuma menyalin isi file `prisma/seed.ts`, jadi **seed tidak cukup**.

Pakai script yang sudah dibuat. Script menolak jalan kalau `DATABASE_URL`
masih `file:`, biar tidak menimpa DB lokal sendiri:

```bash
# PowerShell
$env:DATABASE_URL="libsql://soalml-xxxxx.turso.io"
$env:DATABASE_AUTH_TOKEN="token-kamu"
$env:LOCAL_DB="file:./dev.db"
npm run db:sync
```

Atau di `.env`:

```bash
DATABASE_URL="libsql://soalml-xxxxx.turso.io"
DATABASE_AUTH_TOKEN="token-kamu"
LOCAL_DB="file:./dev.db"
```

Habis itu `DATABASE_URL` di `.env` mengembalikan ke `file:./dev.db` supaya
settingan lokal tetap pakai file.

Outputnya harus `remote now has 130`.

## Langkah 4: Isi environment variable di Vercel

Push dulu perubahan Turso-nya, lalu di Vercel: **Project → Settings →
Environment Variables**.

| Key | Value | Scope |
|---|---|---|
| `DATABASE_URL` | `libsql://soalml-xxxxx.turso.io` | Production + Preview |
| `DATABASE_AUTH_TOKEN` | token dari Langkah 1 | Production + Preview |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Production |
| `ADMIN_USERNAME` | username admin lu | Production |
| `ADMIN_PASSWORD` | password admin lu, **bukan** yang dari `.env.example` | Production |
| `NEXT_PUBLIC_SITE_URL` | domain produksi, mis. `https://soalml.vercel.app` | Production |
| `TRUST_PROXY` | `true` | Production |

`AUTH_SECRET` minimal 32 karakter acak. Kalau kosong atau masih
`ubah-ini-jadi-string-acak-panjang`, `verifyToken()` menolak semua token, jadi
admin tidak akan bisa login sama sekali. Ini disengaja, bukan bug.

`TRUST_PROXY=true` aman di Vercel karena Vercel yang menulis
`x-forwarded-for`. Tanpa itu semua visitor berbagi satu bucket rate limit
login. Jangan set `true` di lokal, karena `x-forwarded-for` bisa dipalsukan
klien.

## Langkah 5: Deploy

```bash
git add -A
git commit -m "feat: pindah ke libSQL untuk deploy Vercel"
git push
```

Vercel auto-deploy. Kalau belum terhubung, **Add New → Project** → import repo
ini. Framework harus terdeteksi Next.js, build command dibiarkan default
(`npm run build`).

## Langkah 6: Verifikasi

Tidak ada yang di bawah ini yang bisa dianggap beres tanpa dicek manual.

```bash
# Header keamanan + CSP harus ada
curl -sI https://soalml.vercel.app | grep -iE "content-security-policy|x-frame|strict-transport"

# CSP harus punya nonce, dan tidak boleh ada unsafe-inline
curl -sI https://soalml.vercel.app | grep -i content-security-policy
```

Lalu cek di browser:

1. `/` terbuka, jumlah soal sesuai dengan yang di dashboard admin.
2. `/soal` filter dan flashcard jalan. Console browser harus bersih; kalau CSP
   memblokir script, errornya muncul di console sebagai
   `Content Security Policy violation`.
3. Login di `/admin/login`, lalu coba tambah satu soal dari `/admin/questions/new`.
   **Ini yang membuktikan tulisannya benar-benar ketahan.** Kalau habis refresh
   soalnya hilang, berarti token Turso belum ke-set di Vercel.
4. Hapus soal tes itu lagi.
5. `https://soalml.vercel.app/admin` harus redirect ke `/admin/login` kalau belum login.

## Langkah 7: Matikan preview publik

 Catatan: preview deployment secara bawaan **publik**. Yang di-deploy ke
preview itu env var Production, artinya `AUTH_SECRET` production ikut terpakai
di URL preview. Kalau URL itu bocor atau ter-index, akses admin lu jadi terbuka.

**Settings → Deployment Protection → Vercel Authentication**, atau minimal
aktifkan **Password Protection** untuk preview.

Belum diverifikasi di repo ini karena itu setelan dashboard, bukan kode.

---

## Deploy ulang / update isi soal

Tidak perlu `migrate` lagi kalau cuma ganti teks atau tambah soal dari admin.
Kalau schema berubah (`prisma/schema.prisma` diedit):

```bash
# 1. Buat SQL untuk selisih antara schema remote dan schema lokal
npx prisma migrate diff \
  --from-url "libsql://soalml-xxxxx.turso.io" \
  --to-schema prisma/schema.prisma \
  --script > turso-diff.sql

# 2. Cek dulu isinya sebelum dijalankan
type turso-diff.sql

# 3. Terapkan
npx turso db shell soalml < turso-diff.sql
```

Kalau masih ada soal lokal yang mau ikut ke production:

```bash
npm run db:sync
```

Script-nya melakukan upsert berdasarkan `id`, jadi soal yang sudah ada di
remote akan di-update, bukan diduplikasi.

## Kalau ada error

**`SQLITE_CANTOPEN` atau `attempt to write a readonly database`**
`DATABASE_URL` masih `file:./dev.db` di Vercel, atau `dev.db` ikut ter-deploy.
Harusnya `libsql://…`.

**Semua query 401, atau `Unauthorized`**
`DATABASE_AUTH_TOKEN` belum di-set atau salah. Token tidak opsional untuk
Turso remote.

**`/admin` selalu balik ke login walau password benar**
`AUTH_SECRET` kosong, masih placeholder, atau berubah antar deploy. Session
cookie ditandatangani dengan nilai itu, jadi mengubahnya membatalkan semua
session.

**Halaman blank, muncul CSP violation di console**
`style-src` butuh nonce untuk setiap `<style>`. Kalau ada komponen yang
menyisipkan `style={{...}}` inline, itu bakal diblokir, karena nonce tidak
pernah berlaku untuk atribut `style`. Pakai class (lihat `.notice-err` di
`globals.css` sebagai contoh).

**Build gagal di Vercel tapi jalan lokal**
`@libsql/client` punya native binding per-platform. Pastikan
`serverExternalPackages` di `next.config.ts` masih berisi `@libsql/client`.
Kalau masih ada `better-sqlite3` di situ, itu sisa yang sudah dibuang.

**Rate limit tidak jalan**
`TRUST_PROXY` belum `true`. Gejalanya satu username yang gagal 5 kali langsung
memblokir semua orang, bukan cuma satu IP.