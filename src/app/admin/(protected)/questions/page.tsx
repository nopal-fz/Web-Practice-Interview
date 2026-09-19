import Link from "next/link";
import { deleteQuestion } from "@/app/admin/actions";
import { DeleteButton } from "@/components/delete-button";
import { Pagination } from "@/components/pagination";
import { buildQuery, difficultyLabels, difficultyStyles, titleize } from "@/lib/format";
import { getFilterOptions, getQuestions } from "@/lib/questions";
import { roleLabel } from "@/lib/roles";

export const metadata = { title: "Kelola soal" };

type SearchParams = Promise<{
  role?: string;
  category?: string;
  difficulty?: string;
  q?: string;
  page?: string;
}>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

const selectClass = "field px-2 py-3 sm:py-1.5";

export default async function AdminQuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters = {
    role: first(sp.role),
    category: first(sp.category),
    difficulty: first(sp.difficulty),
    q: first(sp.q),
  };
  const requestedPage = Number.parseInt(first(sp.page) ?? "1", 10);

  const [{ items, total, totalPages, page }, options] = await Promise.all([
    getQuestions(filters, Number.isNaN(requestedPage) ? 1 : requestedPage),
    getFilterOptions(),
  ]);

  const hasFilters = Boolean(filters.role || filters.category || filters.difficulty || filters.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Kelola soal</h1>
          <p className="text-sm text-[var(--fg-muted)]">{total} soal ditemukan.</p>
        </div>
        <Link href="/admin/questions/new" className="btn-primary px-3 py-3 sm:py-2">
          Tambah soal
        </Link>
      </div>

      <form
        action="/admin/questions"
        className="card space-y-3 p-4 lg:flex lg:flex-row lg:items-end lg:gap-3 lg:space-y-0"
      >
        <div className="flex-1 basis-3/5">
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fg-muted)]">
            Cari
            <input
              type="search"
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Cari soal"
              className="field px-2 py-3 sm:py-1.5"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fg-muted)]">
          Role
          <select name="role" defaultValue={filters.role ?? ""} className={selectClass}>
            <option value="">Semua role</option>
            {options.roles.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fg-muted)]">
          Topik
          <select name="category" defaultValue={filters.category ?? ""} className={selectClass}>
            <option value="">Semua topik</option>
            {options.categories.map((category) => (
              <option key={category} value={category}>
                {titleize(category)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fg-muted)]">
          Kesulitan
          <select name="difficulty" defaultValue={filters.difficulty ?? ""} className={selectClass}>
            <option value="">Semua tingkat</option>
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
          </select>
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary w-full px-4 py-3 sm:py-1.5">
            Terapkan
          </button>
          {hasFilters && (
            <Link href="/admin/questions" className="link-accent shrink-0 text-sm">
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="hairline text-xs">
            <tr>
              <th className="px-4 py-2 font-medium text-[var(--fg-soft)]">Pertanyaan</th>
              <th className="px-4 py-2 font-medium text-[var(--fg-soft)]">Role</th>
              <th className="px-4 py-2 font-medium text-[var(--fg-soft)]">Topik</th>
              <th className="px-4 py-2 font-medium text-[var(--fg-soft)]">Kesulitan</th>
              <th className="px-4 py-2 text-right font-medium text-[var(--fg-soft)]">Aksi</th>
            </tr>
          </thead>
          <tbody className="lines">
            {items.map((question) => (
              <tr key={question.id} className="align-top hover:bg-[var(--surface-muted)]">
                <td className="max-w-md px-4 py-3 font-medium">{question.question}</td>
                <td className="px-4 py-3 text-[var(--fg-muted)]">{roleLabel(question.role)}</td>
                <td className="px-4 py-3 text-[var(--fg-muted)]">{titleize(question.category)}</td>
                <td className="px-4 py-3">
                  <span className={difficultyStyles[question.difficulty] ?? "badge badge-muted"}>
                    {difficultyLabels[question.difficulty] ?? question.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/questions/${question.id}/edit`}
                      className="link-accent rounded px-2 py-1 text-sm"
                    >
                      Ubah
                    </Link>
                    <form action={deleteQuestion}>
                      <input type="hidden" name="id" value={question.id} />
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-[var(--fg-soft)]">
                  Tidak ada soal yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFor={(target) => `/admin/questions?${buildQuery({ ...filters, page: String(target) })}`}
      />
    </div>
  );
}