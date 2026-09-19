import Link from "next/link";
import type { Metadata } from "next";
import { QuestionList } from "@/components/question-list";
import { SearchShortcut } from "@/components/search-shortcut";
import { buildQuery, titleize } from "@/lib/format";
import { getFilterOptions, getQuestions } from "@/lib/questions";
import { roleLabel } from "@/lib/roles";
import type { QuestionFilters } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Semua soal",
  alternates: { canonical: "/questions" },
};

type SearchParams = Promise<{
  role?: string;
  category?: string;
  difficulty?: string;
  q?: string;
  page?: string;
  bookmarked?: string;
}>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

const selectClass = "field px-2 py-3 sm:py-1.5";

function RoleChips({ roles, filters }: { roles: string[]; filters: QuestionFilters }) {
  const all = [{ role: undefined }, ...roles.map((role) => ({ role }))];
  return (
    <nav aria-label="Filter role" className="role-scroller -mx-4 px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 pb-0.5 sm:w-auto sm:flex-wrap">
        {all.map(({ role }) => {
          const active = filters.role === role;
          const href = `/questions?${buildQuery({ ...filters, role, page: undefined })}`;
          return (
            <li key={role ?? "all"}>
              <Link
                href={href}
                aria-current={active ? "true" : undefined}
                className={`chip px-3 py-2 text-sm sm:py-1.5 ${
                  active
                    ? "border-[var(--accent-btn)] text-[var(--accent)]"
                    : "text-[var(--fg-muted)]"
                }`}
              >
                {role ? roleLabel(role) : "Semua role"}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default async function QuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const mode: "all" | "bookmarked" = first(sp.bookmarked) === "1" ? "bookmarked" : "all";
  const filters = {
    role: first(sp.role),
    category: first(sp.category),
    difficulty: first(sp.difficulty),
    q: first(sp.q),
  };
  const requestedPage = Number.parseInt(first(sp.page) ?? "1", 10);

  const [{ items, total, totalPages, page }, options] = await Promise.all([
    // ponytail: cap 1000, tab bookmark menampilkan seluruh kandidat saat ini.
    // Ganti dengan filter endpoint sungguhan kalau katalog melewati 1000 soal.
    getQuestions(filters, Number.isNaN(requestedPage) ? 1 : requestedPage, {
      limit: mode === "bookmarked" ? 1000 : undefined,
    }),
    getFilterOptions(),
  ]);

  const hasFilters = Boolean(filters.role || filters.category || filters.difficulty || filters.q);
  const baseQuery = buildQuery(filters);
  const hrefAll = `/questions${baseQuery ? `?${baseQuery}` : ""}`;
  const hrefBookmarked = `/questions?${buildQuery({ ...filters, bookmarked: "1" })}`;

  return (
    <div className="space-y-6">
      {mode !== "bookmarked" && (
        <div className="space-y-1">
          <p className="eyebrow">
            {total} soal{hasFilters ? " cocok dengan filter" : " tersedia"}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Semua soal</h1>
        </div>
      )}

      <form
        action="/questions"
        className="card space-y-3 p-4 lg:flex lg:flex-row lg:items-end lg:gap-3 lg:space-y-0"
      >
        <div className="flex-1 basis-3/5">
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--fg-muted)]">
            Cari
            <span className="relative">
              <input
                type="search"
                name="q"
                id="q-search"
                defaultValue={filters.q ?? ""}
                placeholder="Cari di pertanyaan, jawaban, tag"
                className="field w-full px-2 py-3 pr-10 sm:py-1.5 sm:pr-9"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--border-strong)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[0.6875rem] text-[var(--fg-soft)] sm:inline-flex">
                /
              </kbd>
            </span>
          </label>
        </div>

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
            <Link href="/questions" className="link-accent shrink-0 text-sm">
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="relative">
        <RoleChips roles={options.roles} filters={filters} />
      </div>

      <QuestionList
        items={items}
        mode={mode}
        total={total}
        page={page}
        totalPages={totalPages}
        hrefAll={hrefAll}
        hrefBookmarked={hrefBookmarked}
        baseQuery={baseQuery}
      />

      <SearchShortcut inputId="q-search" />
    </div>
  );
}