# CHECKLIST-UI

Checklist singkat untuk pekerjaan UI apa pun di proyek ini. Jalankan sebelum menyelesaikan task desain. Ringkasan dari `antislop` (core + ui). Detail lengkap: `C:\Users\NAUFAL FAIZ\.config\opencode\skills\antislop\SKILL.md` dan `DESIGN.md` untuk arah.

## Sebelum mulai

- Sudah baca `DESIGN.md`? (palet, typografi, radius, dials ENERGY 2 / RHYTHM 2 / MOTION 1)
- Keputusan desain besar punya alasan satu baris (R-31)? Tuliskan.

## Saat membangun

- **Satu accent** (teal) untuk semua interaksi. Warna emerald/amber/rose hanya untuk badge kesulitan.
- **Radius:** `rounded-lg` kontrol, `rounded-xl` kontainer, `rounded-full` chip. Jangan dicampur asal.
- **Tap target** minimal 44px di mobile (`py-3 ... sm:py-2`).
- **Kontras:** teks kecil di atas putih minimal `text-zinc-500`. Jangan `text-zinc-400` untuk teks yang harus terbaca.
- **Focus:** jangan `outline-none`; biarkan `:focus-visible` global bekerja.
- **Tidak ada kontrol mati** (button/link tanpa aksi → buang atau `// TODO` + label "Segera").
- **State lengkap:** empty, error (`error.tsx`), 404 (`not-found.tsx`), dan loading saat ada fetch klien.
- **Copy human:** tanpa em dash (`—`), tanpa buzzword (AI Powered, Seamless, Next Generation), tanpa statistik palsu, CTA spesifik.

## Sebelum mengirim

- `npm run lint` hijau.
- `npm run build` sukses.
- Cek mobile: tidak ada overflow horizontal, kartu tidak tabrakan, header tetap enak.
- Halaman error dan not-found telah diverifikasi dijalankan.