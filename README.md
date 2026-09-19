# Bank Soal Interview

Aplikasi web berisi kumpulan soal interview untuk role Data Scientist, AI Engineer, dan ML
Engineer. Semua soal bisa dibaca siapa saja; hanya admin yang bisa menambah, mengubah, menghapus,
dan mengimpor soal secara massal.

## Fitur

- Publik: daftar soal dengan filter role/topik/kesulitan/kata kunci, pencarian, pagination, dan
  halaman detail per soal. Jawaban di-render dari markdown dan bisa dibuka/tutup.
- Admin (`/admin`, login single user): dashboard statistik, CRUD soal, serta import massal dari
  file atau tempel data JSON/CSV.
- Markdown didukung di jawaban (heading, list, tabel, code block, dan lainnya).

## Tech Stack

| Bagian    | Teknologi                                    |
| --------- | -------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)           |
| Bahasa    | TypeScript, React 19                         |
| Styling   | Tailwind CSS v4                              |
| Database  | SQLite via Prisma 7 + better-sqlite3 adapter |
| Markdown  | react-markdown + remark-gfm                  |
| Import    | papaparse (CSV) + JSON.parse                 |

## Struktur Halaman

| Route                        | Akses   | Keterangan                          |
| ---------------------------- | ------- | ----------------------------------- |
| `/`                          | Publik  | Landing + pencarian                 |
| `/questions`                 | Publik  | Daftar soal + filter & pagination   |
| `/questions/[id]`            | Publik  | Detail soal + jawaban               |
| `/admin/login`               | Publik  | Login admin                         |
| `/admin`                     | Admin   | Dashboard statistik                 |
| `/admin/questions`           | Admin   | Tabel soal + filter & hapus         |
| `/admin/questions/new`       | Admin   | Form tambah soal                    |
| `/admin/questions/[id]/edit` | Admin   | Form ubah soal                      |
| `/admin/import`              | Admin   | Import massal JSON/CSV              |

## Setup

1. Install dependency:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env` lalu sesuaikan:

   ```bash
   DATABASE_URL="file:./dev.db"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="pilih-password-anda"
   AUTH_SECRET="string-acak-minimal-32-karakter"
   ```

   Generate `AUTH_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Buat tabel di database (migration sudah tersedia):

   ```bash
   npm run db:migrate
   ```

4. Isi data contoh (30 soal). Seeder dilewati otomatis bila tabel sudah berisi data:

   ```bash
   npm run db:seed
   ```

## Menjalankan

```bash
npm run dev      # development, http://localhost:3000
npm run build    # build produksi
npm run start    # jalankan hasil build
```

Login admin memakai `ADMIN_USERNAME` dan `ADMIN_PASSWORD` dari `.env`. Sesi disimpan sebagai
cookie HttpOnly yang ditandatangani HMAC `AUTH_SECRET` dan berlaku 7 hari.

## Perintah Lain

```bash
npm run lint   # ESLint
npm test       # cek parser import (tsx, tanpa framework)
```

## Format Import

Field wajib: `role`, `category`, `question`, `answer`. Field opsional: `difficulty`
(`easy`/`medium`/`hard`, default `medium`) dan `tags`.

JSON berupa array soal, atau objek dengan field `questions` berisi array:

```json
[
  {
    "role": "data-scientist",
    "category": "statistics",
    "difficulty": "medium",
    "question": "Apa itu p-value?",
    "answer": "Penjelasan **markdown** di sini.",
    "tags": "statistik, hipotesis"
  }
]
```

CSV memakai baris pertama sebagai nama kolom. Kutip nilai yang mengandung koma:

```csv
role,category,difficulty,question,answer,tags
data-scientist,statistics,medium,"Apa itu p-value?","Penjelasan markdown.","statistik, hipotesis"
```

Baris yang tidak valid dilewati dan jumlahnya dilaporkan setelah proses selesai.

## Catatan Deploy (Vercel)

SQLite menyimpan data di file lokal (`dev.db`), sedangkan filesystem Vercel bersifat sementara
sehingga data bisa hilang setelah redeploy. Untuk produksi di Vercel, ganti provider Prisma ke
Postgres (mis. Neon/Supabase):

1. Ubah `provider` di `prisma/schema.prisma` menjadi `postgresql` dan hapus penggunaan
   `@prisma/adapter-better-sqlite3` di `src/lib/db.ts` (cukup pakai `new PrismaClient()`).
2. Set `DATABASE_URL` ke connection string Postgres di environment variables Vercel.
3. Jalankan `npx prisma migrate deploy` pada database baru, lalu import data lewat menu
   `/admin/import`.

Selama fase pengembangan lokal, SQLite sudah cukup dan tidak butuh server database terpisah.
