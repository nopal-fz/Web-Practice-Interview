# CHECKLIST-UI — LearnML

Jalankan checklist ini SETELAH komponen/halaman selesai dikode, sebelum
dianggap "done". Ambil token dari `DESIGN.md`.

## Token compliance

- [ ] Background base pakai `#0D1117`, bukan hitam pekat (`#000`) atau warna lain
- [ ] Card/surface pakai `#151B23` atau `#1C212B` (muted), bukan gradasi/shadow custom
- [ ] Border pakai `#262C36` (default) / `#363D4A` (strong) — sharp 1px, TIDAK ada
      box-shadow buat elevation
- [ ] Radius: `4px` untuk card/control/domain-card, `9999px` HANYA untuk chip
      inline — gak ada radius lain yang muncul
- [ ] Accent violet (`#6E56CF`) cuma dipakai buat interactive state (focus,
      hover, active tab, primary button) — bukan dekorasi pasif
- [ ] Amber (`#E8A33D`) cuma buat highlight insight/live-metric, bukan dipakai
      general-purpose kayak violet
- [ ] Domain border-left (Blue=Classical ML, Violet=DL, Amber=LLM) konsisten
      di semua domain card, gak ketuker

## Typography

- [ ] Heading pakai Space Grotesk, body/UI pakai IBM Plex Sans, code/math/live
      metric pakai IBM Plex Mono — TIDAK ketuker (mono dipakai buat label biasa?)
- [ ] Line length body < 80 karakter
- [ ] Gak ada bold/warna beda di satu kata doang di tengah heading

## Motion (paling sering kebobolan — cek dua kali)

- [ ] Page-enter fade-up 350ms itu SATU KALI pass, BUKAN staggered per section
- [ ] Gak ada reveal-on-scroll di section manapun (Dials bilang MOTION:1,
      no scroll animation — kalau ada, itu bug terhadap DESIGN.md sendiri)
- [ ] Tidak ada elemen yang animasi loop terus-menerus. Kalau ada, motifnya harus
      benar-benar menjelaskan sesuatu, bukanodon 임시 animasi biar "terasa hidup"
- [ ] `prefers-reduced-motion` dihormati

## Copy & content

- [ ] CTA pakai active voice, aksi konkret ("Mulai dari katalog soal" bukan "Get Started")
- [ ] Gak ada testimonial/logo bar/fake stats palsu (sesuai R-31: evidence
      over claims)
- [ ] Badge Easy/Medium/Hard pakai warna sesuai spec, TAPI cek juga: apa ini
      kerasa generic (persis GitHub/Linear label)? Kalau iya, pertimbangkan
      dot indicator atau icon kecil sebagai pembeda dari dev-tool default

## Hard-ban final scan

- [ ] Gak ada `→` di akhir tombol/link manapun
- [ ] Gak ada ALL CAPS eyebrow di atas heading
- [ ] Gak ada middle-dot meta text (`A · B · C`)
- [ ] Gak ada numbering 01/02/03 di card yang bukan sequence asli
- [ ] Gak ada shadow abu-abu generik nempel di card manapun
- [ ] Gak ada angka atau status yang dikarang (fake engine version, angka dari
      `Math.random()` yang disajikan seolah data nyata, "10K+ pengguna").
      Semua angka harus bisa ditelusuri ke query DB

## Tema (wajib cek dua kali)

- [ ] Toggle tema benar-benar mengubah tampilan di kedua mode, bukan cuma ikon
- [ ] TEMA gelap dan terang punya nilai accent TEKST yang berbeda. Kalau satu
      nilai `--accent` dipakai buat link teks DAN background button, minimal satu
      mode gagal WCAG AA
- [ ] Body copy, badge, border, dan code block dicek kontrasnya di kedua tema,
      bukan cuma di tema default
- [ ] Nggak ada `dark:` variant Tailwind yang dobel dengan token
      `[data-theme="light"]`. Pilih satu sistem, jangan dua-duanya
- [ ] Inline script di `<head>` menerapkan tema sebelum first paint (no flash)
- [ ] Ketiadaan localStorage (private mode) tidak bikin halaman blank; tema
      default tetap jalan

## Kalau salah satu di atas gagal

Jangan patch dikit-dikit — balik ke `DESIGN.md`, cek token yang bener, terus
perbaiki di source-nya (component/token file), bukan override inline di
satu tempat doang.