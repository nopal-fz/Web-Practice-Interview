import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h1 className="font-display text-xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
        URL yang kamu tuju tidak tersedia, atau soalnya sudah dihapus.
      </p>
      <Link
        href="/"
        className="btn-primary inline-flex px-4 py-3 sm:py-2"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}