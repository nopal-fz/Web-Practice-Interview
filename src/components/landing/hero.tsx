import Link from "next/link";

export function Hero({ total }: { total: number }) {
  return (
    <div className="pt-[88px] pb-[72px] text-center max-md:pt-14">
      <h1 className="mb-7 font-display text-[clamp(44px,9vw,104px)] font-bold leading-[0.98] tracking-[-0.03em] text-ink">
        Interview data &amp; ML
        <br />
        <span className="inline-block rounded-[0.12em] bg-hl px-[0.12em]">pasti bisa dijawab.</span>
      </h1>
      <p className="mx-auto mb-10 max-w-[620px] text-[clamp(18px,2.4vw,24px)] text-mut">
        {total} soal Machine Learning dan AI dengan pembahasan bertingkat: rumus, intuition, dan
        kode yang bisa langsung dijalankan.
      </p>

      <form action="/soal" className="mx-auto max-w-[560px]">
        {/* Not id="mulai": the Browse section already owns that id, and a duplicate id
            sends every #mulai jump to this input instead. */}
        <label htmlFor="hero-search" className="lbl mb-3 block">
          Cari topik yang mau dilatih
        </label>
        <input
          id="hero-search"
          name="q"
          type="search"
          placeholder="contoh: A/B testing, class imbalance"
          className="field w-full text-left"
        />
        <button type="submit" className="btn mt-6">
          Mulai latihan
        </button>
      </form>

      <p className="mt-4 text-mut">
        Sudah pernah lihat soal ini?{" "}
        <Link href="/soal?mode=latihan" className="font-extrabold text-pri">
          Buka mode latihan
        </Link>
      </p>
    </div>
  );
}