# PRD: Bank Soal Interview Data/AI/ML

## Tujuan

Web app kumpulan soal interview untuk role Data Scientist, AI Engineer, ML Engineer, dan role terkait. Dua sisi akses: publik untuk baca dan cari soal, admin untuk kelola soal.

## Stack

- Next.js (App Router) + TypeScript + TailwindCSS
- SQLite via Prisma (tanpa DB eksternal, jalan lokal dengan `npm run dev`)
- Auth admin single-user: credential dari `.env`, sesi via cookie signed (HMAC dari `AUTH_SECRET`)

## Data Model: Question

| Field | Tipe | Keterangan |
|---|---|---|
| role | string | Fleksibel: `data-scientist`, `ai-engineer`, `ml-engineer`, dll. Bisa tambah kategori baru lewat form |
| category | string | `statistics`, `sql`, `system-design`, `ml-theory`, `coding`, `behavioral`, dll |
| difficulty | string | `easy` / `medium` / `hard` |
| question | string | Pertanyaan |
| answer | string | Markdown, mendukung code block |
| tags | string | Komma-separated, dipakai untuk search |
| createdAt / updatedAt | datetime | Otomatis |

Catatan: role, category, tags disimpan sebagai string bebas (bukan enum/relasi) supaya fleksibel menambah nilai baru tanpa migrasi. Enum Prisma tidak dipakai. `tags` string, karena Prisma tidak mendukung `String[]` di SQLite.

## Fitur Publik

- Landing (`/`): daftar role dan kategori + jumlah soal, link ke list soal.
- List soal (`/questions`): filter role, kategori, difficulty, keyword pencarian (GET params, tanpa JS). Pagination nomor halaman.
- Detail soal (`/questions/[id]`): jawaban collapsible (native `<details>`), markdown di-render (termasuk code block, tanpa syntax highlight di v1).

## Fitur Admin (`/admin`)

- Login: form username/password, validasi terhadap `.env`, simpan cookie HttpOnly signed.
- Dashboard: total soal + breakdown per role dan per kategori.
- CRUD soal: form role, category, difficulty, pertanyaan, jawaban (textarea markdown + toggle preview), tags.
- Bulk import: upload/paste file JSON (`.json`) atau CSV (`papaparse`), dengan validasi kolom wajib.
- Tabel list soal admin + search & filter + hapus.

## Non-Functional

- Responsive mobile (kemungkinan dipakai saat commute).
- Lokal: `npm run dev` langsung jalan, seed tersedia.
- Seed data: minimal 10 soal per role (data-scientist, ai-engineer, ml-engineer).

## Deploy Vercel

Konflik: SQLite (file lokal) tidak persisten di serverless Vercel. Keputusan: build dengan SQLite untuk lokal, dan saat deploy dokumentasikan/migrasi provider Prisma ke Postgres (Supabase/Neon/CockroachDB). Schema ID string (cuid) dibuat agnostik antar database supaya swap provider minim perubahan.

## Keputusan yang Sudah Disepakati

- SQLite untuk dev, catatan swap ke Postgres untuk Vercel.
- Import JSON + CSV (pakai papaparse).
- Pagination nomor halaman.
- Editor jawaban: textarea + toggle preview.
- Syntax highlighting code block: tidak di v1.

## Out of Scope v1

Syntax highlighting, auth multi-user, komentar/like, rate limiting, dark mode toggle.