import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-4 font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
        Halaman tidak ditemukan
      </h1>
      <p className="mb-8 max-w-[480px] text-[19px] text-mut">
        URL yang kamu tuju tidak tersedia, atau soalnya sudah dihapus.
      </p>
      <Link href="/" className="btn">
        Kembali ke beranda
      </Link>
    </main>
  );
}