# DESAIN BANK SOAL INTERVIEW

## Identitas

Alat bantu latihan interview untuk pemburu kerja di bidang data dan AI.
Audience utama: kandidat junior sampai mid-level yang butuh latihan mandiri sebelum interview nyata.
Tone: **Serius tapi tidak dingin**. Fungsional, lugas, tidak perlu "ramah" berlebihan; yang penting jelas dan membantu.

**Personality**

- Terpercaya (akurat, rapi, tanpa jualan)
- Efisien (cepat cari, cepat baca, cepat latihan)
- To the point (tanpa basa-basi, tanpa buzzword)

## Palet

- **Terang (kertas hangat, bukan putih klinis):** background `#f9f7f4`, kartu `white`, border hangat `#e7e4dd`-`#d6d2c8`, ink `#201e1b`.
- **Gelap (abu hampir-hitam hangat, bukan pitch black):** background `#0e0e11`, kartu `#17171b`, border `#28282e`-`#3a3a42`, ink `#ececea`.
- **Accent:** teal. Terang `#0f766e` (teks/link/tombol), gelap `#2dd4bf` untuk teks/link agar kontras di latar gelap, tombol tetap teal-700. Dipakai cuma di titik kunci: wordmark, link, tombol utama, focus ring, marker list.
- **Status semantik (kecuali):** emerald/amber/rose dipakai khusus untuk badge kesulitan (mudah/sedang/sulit) dan pesan sukses/error. Ini fungsi, bukan dekorasi, sehingga diperbolehkan melebihi "satu accent" secara literal.

Semua warna didukung token CSS (`--background`, `--surface`, `--border`, `--fg-*`, `--accent`, `--badge-*`) di `globals.css`; mode gelap menukar nilai var, tanpa menaburi `dark:` di seluruh komponen.

## Tipografi

- Sans: **Geist** untuk body dan UI. Alasan: ringan, netral, tidak bersaing dengan isi, cocok untuk teks Bahasa Indonesia yang panjang.
- Display: **Fraunces** untuk judul (h1, wordmark, heading kartu). Alasan: serif editorial yang memberi identitas "buku latihan", kontras kuat dengan sans Geist, dan bukan font display default AI yang umum. Karakter datang dari tipografi, bukan dekorasi.
- Mono: **Geist Mono** untuk kode, tag, dan label editorial (eyebrow). Alasan: konsisten dengan sans-nya.
- Mode gelap/terang otomatis lewat `prefers-color-scheme` saat pertama buka, bisa di-toggle manual (disimpan di localStorage).

## Spacing & Radius

- `rounded-lg` (8px) untuk kontrol interaktif (input, tombol, badge).
- `rounded-xl` (12px) untuk kontainer kartu dan panel.
- `rounded-full` untuk chip kategori (inline pill).
- Spasi umum: `gap-3`~`gap-6` untuk grup, `py-8` untuk konten utama, `py-3` header, `py-6` footer.

Alasan: konsistensi dan hierarki visual yang bisa diprediksi tanpa variabel acak.

## Dials

| Dial | Nilai | Alasan |
|---|---|---|
| ENERGY | 2 | Tenang, bukan showcase; ini tool utilitas, bukan portofolio atau kampanye. |
| RHYTHM | 2 | Komposisi berulang secara sadar: kartu data, daftar, form; variasi yang ada adalah fungsi (daftar vs grid vs form), bukan estetika. |
| MOTION | 1 | Statis. Satu pengecualian yang diminta eksplisit: animasi buka-tutup jawaban (flashcard) memakai transisi CSS `grid-template-rows` untuk kebutuhan self-quiz. |

## Motif Identitas

1. **Badge kesulitan** (`ring-inset` + warna status) sebagai elemen berulang: elemen pertama yang dilihat di setiap soal.
2. **Label editorial (eyebrow)**: teks mono uppercase kecil di atas heading dan nomor indeks (01, 02, 03) di daftar role, memberi nuansa daftar isi buku.
3. **Wordmark serif akhiran titik teal** ("Bank Soal *Interview.*") sebagai tanda tangan visual di header.

## Keputusan Desain Penting (R-31)

- **Mode terang + gelap dengan toggle:** topik utama dunia data/AI sering dibaca larut malam, jadi pilihan tema diserahkan ke user (default ikut sistem). Toggle di header, kelas `.dark` di `<html>`, inline script untuk mencegah flash saat (R-21, R-34).
- **Tanpa gambar/ilustrasi:** bank soal berbasis teks; gambar tidak menambah nilai.
- **Warna kesulitan = status, bukan aksen:** emerald/amber/rose hanya untuk badge kesulitan, tidak dipakai untuk link atau tombol.
- **Satu accent (teal) untuk semua interaksi:** link, tombol utama, fokus ring. Tidak ada aksen kedua.
- **Syntax highlighting hanya 4 warna token** (keyword/string/number/comment), bukan pelangi seperti tema populer; fungsi utamanya memisahkan kode dari prosa di jawaban (rehype-highlight).
- **Kartu memakai border tipis + hover, bukan shadow:** konten teks yang padat tidak perlu mengambang; shadow hanya untuk isyarat paling penting.

## Pertimbangan Masa Depan

- Identity motif lebih kuat (mark/logo) bila dipublikasikan lebih luas.
- Fitur baru seperti progres latihan, timer, atau mode simulasi interview.
