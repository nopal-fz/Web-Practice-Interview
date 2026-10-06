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

  const idle =
    "inline-flex min-h-[44px] items-center rounded-full border-2 border-line px-5 py-2 font-bold text-mut transition-colors hover:border-pri hover:text-ink";
  const active =
    "inline-flex min-h-[44px] items-center rounded-full border-2 border-pri bg-pri-fill px-5 py-2 font-bold text-white";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Navigasi halaman">
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