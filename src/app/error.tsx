"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h1 className="font-display text-xl font-semibold tracking-tight">Terjadi kesalahan</h1>
      <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
        Gagal memuat halaman ini. Coba muat ulang, atau kembali beberapa saat lagi.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="btn-primary px-4 py-3 sm:py-2"
      >
        Coba lagi
      </button>
    </div>
  );
}