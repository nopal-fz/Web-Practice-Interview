// Each answer here should be something the page itself does not already show.
// Anything answerable by looking at the catalog (which filters exist, which
// difficulty levels there are) belongs in the UI, not in prose.
const faqs = [
  {
    q: "Apa isi pembahasannya?",
    a: "Tiga lapis: rumus, penjelasan kenapa begitu, lalu kode yang bisa langsung dijalankan.",
  },
  {
    q: "Kenapa jawabannya disembunyikan dulu?",
    a: "Supaya kamu benar-benar mencoba menjawab sendiri sebelum membandingkan. Membaca jawaban langsung terasa productive, tapi tidak menguji pemahaman apa pun.",
  },
  {
    q: "Gimana cara menyimpan soal?",
    a: "Buka soal di katalog, lalu tekan Simpan. Soal tersimpan dan yang sudah dikuasai punya tab sendiri.",
  },
  {
    q: "Di mana bookmark-nya disimpan?",
    a: "Di browser kamu sendiri, bukan di server. Tidak ada akun, jadi bookmark akan hilang kalau kamu clears data browser atau ganti perangkat.",
  },
  {
    q: "Bisa difilter sesuai peran?",
    a: "Bisa, dan boleh lebih dari satu sekaligus. Pilih beberapa peran di katalog, misalnya AI Engineer dan Data Scientist, lalu soalnya menyesuaikan.",
  },
  {
    q: "Ada mode latihan?",
    a: "Ada. Tab Latihan bikin kamu menjawab dulu sebelum membuka pembahasan, dengan soal diacak tiap sesi.",
  },
  {
    q: "Soalnya dalam Bahasa Indonesia?",
    a: "Seluruhnya. Istilah teknisnya dibiarkan dalam Bahasa Inggris karena itu yang dipakai di interview.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-[900px] py-[72px]">
      <h2 className="mb-8 font-display text-[clamp(34px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
        Masih ada pertanyaan?
      </h2>

      <div>
        {faqs.map((faq) => (
          <details key={faq.q} className="border-b border-line first:border-t">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 font-display text-[19px] font-bold [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span className="chev" aria-hidden="true" />
            </summary>
            <p className="m-0 max-w-[70ch] pb-6 text-mut">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}