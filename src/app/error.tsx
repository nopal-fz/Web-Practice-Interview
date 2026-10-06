"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-4 font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
        Terjadi kesalahan
      </h1>
      <p className="mb-8 max-w-[480px] text-[19px] text-mut">
        Gagal memuat halaman ini. Coba muat ulang, atau kembali beberapa saat lagi.
      </p>
      <button type="button" onClick={() => reset()} className="btn">
        Coba lagi
      </button>
    </main>
  );
}