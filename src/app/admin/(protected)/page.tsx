import Link from "next/link";
import { titleize } from "@/lib/format";
import { getStats } from "@/lib/questions";
import { roleLabel } from "@/lib/roles";

export const metadata = { title: "Dashboard admin" };

export default async function AdminDashboardPage() {
  const { total, roles, categories } = await getStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--fg-muted)]">
            Total <span className="font-medium">{total}</span> soal di bank soal.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/admin/questions/new"
            className="btn-primary px-3 py-3 sm:py-2"
          >
            Tambah soal
          </Link>
          <Link
            href="/admin/import"
            className="btn-ghost px-3 py-3 sm:py-2"
          >
            Import massal
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="space-y-2">
          <h2 className="eyebrow">Per role</h2>
          <ul className="card lines">
            {roles.map((role) => (
              <li key={role.value} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-[var(--fg-muted)]">{roleLabel(role.value)}</span>
                <span className="tabular-nums text-[var(--fg-soft)]">{role.count}</span>
              </li>
            ))}
            {roles.length === 0 && (
              <li className="px-4 py-3 text-sm text-[var(--fg-soft)]">Belum ada data.</li>
            )}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="eyebrow">Per topik</h2>
          <ul className="card lines">
            {categories.map((category) => (
              <li
                key={category.value}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <span className="text-[var(--fg-muted)]">{titleize(category.value)}</span>
                <span className="tabular-nums text-[var(--fg-soft)]">{category.count}</span>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="px-4 py-3 text-sm text-[var(--fg-soft)]">Belum ada data.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}