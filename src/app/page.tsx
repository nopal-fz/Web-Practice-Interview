import Link from "next/link";
import { getCategoryCounts, getRoleCounts, getTotalCount } from "@/lib/questions";
import { titleize } from "@/lib/format";
import { roleDescription, roleIcon, roleLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [total, roles, categories] = await Promise.all([
    getTotalCount(),
    getRoleCounts(),
    getCategoryCounts(),
  ]);

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <p className="eyebrow">{total} soal tersedia</p>
        <h1 className="font-display max-w-2xl text-3xl font-semibold tracking-tight leading-tight sm:text-4xl">
          Latihan soal interview untuk peran data dan AI.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--fg-muted)]">
          Jawaban bisa dibuka-tutup untuk self-quiz: baca pertanyaannya, jawab sendiri dulu,
          baru cek pembahasannya.
        </p>

        <form action="/questions" className="flex max-w-xl gap-2">
          <input
            type="search"
            name="q"
            placeholder="Cari topik, mis. window function, RAG, overfitting"
            aria-label="Cari soal"
            className="field min-w-0 flex-1 px-3 py-3 sm:py-2"
          />
          <button type="submit" className="btn-primary px-4 py-3 sm:py-2">
            Cari
          </button>
        </form>
      </section>

      {total === 0 ? (
        <div className="panel px-5 py-5 text-sm text-[var(--fg-muted)]">
          Belum ada soal di database. Tambahkan lewat{" "}
          <Link href="/admin" className="link-accent">
            halaman admin
          </Link>{" "}
          atau jalankan <code className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-xs">npm run db:seed</code>.
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-lg font-semibold tracking-tight">Per role</h2>
              <Link href="/questions" className="link-accent text-sm">
                Lihat semua
              </Link>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {roles.map((role, index) => {
                const Icon = roleIcon(role.value);
                return (
                  <li key={role.value}>
                    <Link
                      href={`/questions?role=${encodeURIComponent(role.value)}`}
                      className="card card-hover flex gap-3 p-4"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--accent)]">
                        {Icon && <Icon size={18} strokeWidth={1.75} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-base font-semibold tracking-tight group-hover:text-[var(--accent)]">
                            {roleLabel(role.value)}
                          </span>
                          <span className="eyebrow">{String(index + 1).padStart(2, "0")}</span>
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-[var(--fg-muted)]">
                          {roleDescription(role.value) ||
                            `${role.count} soal latihan untuk role ${roleLabel(role.value).toLowerCase()}.`}
                        </span>
                      </span>
                      <span className="self-center text-sm tabular-nums text-[var(--fg-soft)]">
                        {role.count} soal
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold tracking-tight">Per topik</h2>
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/questions?category=${encodeURIComponent(category.value)}`}
                    className="chip px-3 py-1.5"
                  >
                    {titleize(category.value)}
                    <span className="tabular-nums text-[var(--fg-soft)]">{category.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}