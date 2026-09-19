import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const numbers = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  const base = "rounded-md border px-3 py-3 text-sm tabular-nums sm:py-1.5";
  const idle = `${base} border-[var(--border-strong)] bg-[var(--surface)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]`;
  const active = `${base} border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white`;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Navigasi halaman">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={idle}>
          Sebelumnya
        </Link>
      )}
      {numbers.map((number) => (
        <Link
          key={number}
          href={hrefFor(number)}
          aria-current={number === page ? "page" : undefined}
          className={number === page ? active : idle}
        >
          {number}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={idle}>
          Berikutnya
        </Link>
      )}
    </nav>
  );
}