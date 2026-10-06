import Link from "next/link";
import { getTotalCount, getQuizQuestions, getStats, getQuestions, getFilterOptions } from "@/lib/questions";
import { buildQuery, titleize } from "@/lib/format";
import { QuizShell } from "@/components/quiz-shell";
import { QuestionList } from "@/components/question-list";
import { TopBar } from "@/components/landing/top-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { roleLabel, roleDomain, rolePillClass } from "@/lib/roles";
import type { QuestionFilters } from "@/lib/questions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Katalog soal",
  description: "Katalog soal interview Machine Learning dan AI, filter berdasarkan topik, kesulitan, dan peran.",
};

type SearchParams = {
  mode?: string;
  q?: string;
  topik?: string;
  tingkat?: string;
  peran?: string;
  tersimpan?: string;
  dikuasai?: string;
  page?: string;
  quizRole?: string;
  quizDifficulty?: string;
  quizCount?: string;
};

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

// Landing links use short names (q, topik, peran, tingkat); this builds them back.
function queryOf(filters: QuestionFilters, extra?: Record<string, string | undefined>) {
  return buildQuery({
    q: filters.q,
    topik: filters.category,
    tingkat: filters.difficulty,
    peran: filters.role,
    ...extra,
  });
}

function hrefOf(filters: QuestionFilters, extra?: Record<string, string | undefined>) {
  const query = queryOf(filters, extra);
  return query ? `/soal?${query}` : "/soal";
}

// Multi-select: every role is a toggle link. Clicking a selected role drops it
// from `peran`, clicking an unselected one appends it. No client state, so the
// selection survives a reload and the back button works for free.
function RoleFilter({ roles, filters }: { roles: string[]; filters: QuestionFilters }) {
  const selected = new Set((filters.role ?? "").split(",").filter(Boolean));

  const hrefFor = (role: string) => {
    const next = new Set(selected);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    // Follow ROLE_ORDER, not click order, so the URL does not churn.
    const value = roles.filter((slug) => next.has(slug)).join(",");
    return hrefOf(filters, { peran: value || undefined, page: undefined });
  };

  return (
    <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex w-max gap-3 pb-1 md:w-auto md:flex-wrap">
        <li>
          {selected.size > 0 ? (
            <Link href={hrefOf(filters, { peran: undefined, page: undefined })} className="pill pill-sm text-sm whitespace-nowrap">
              Semua peran
            </Link>
          ) : (
            <span aria-current="true" className="pill pill-sm pill-on text-sm whitespace-nowrap">
              Semua peran
            </span>
          )}
        </li>
        {roles.map((role) => {
          const on = selected.has(role);
          return (
            <li key={role}>
              <Link
                href={hrefFor(role)}
                aria-pressed={on}
                className={`pill pill-sm pill-role ${rolePillClass[roleDomain(role)]} text-sm whitespace-nowrap`}
              >
                {roleLabel(role)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function SoalPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const latihanMode = first(sp.mode) === "latihan";

  const [total, stats, questionOptions] = await Promise.all([
    getTotalCount(),
    getStats(),
    getFilterOptions(),
  ]);

  const quizRole = first(sp.quizRole);
  const quizDifficulty = first(sp.quizDifficulty);
  // "Semua" arrives as the literal "all"; anything else parses as a count.
  const countParsed = Number.parseInt(first(sp.quizCount) ?? "", 10);
  // Cap at 50, the largest offered option. Capping at 100 while the form only
  // offers up to 50 (or "all" = every match) meant the bound could never bind.
  const quizCount = Number.isNaN(countParsed) ? undefined : Math.max(1, Math.min(50, countParsed));
  // Gates on presence of the params, not on their parsed values. "Mulai sesi"
  // with every filter left at "Semua" used to send an empty quizCount, which
  // parsed to undefined, so hasQuizParams was false and the button did nothing.
  // Testing sp.quizCount is what separates "submitted as Semua" from "never
  // submitted": first() collapses "" to undefined, so the parsed count cannot
  // tell those two apart.
  const hasQuizParams = Boolean(quizRole || quizDifficulty || sp.quizCount !== undefined);
  const quizQuestions =
    latihanMode && hasQuizParams
      ? await getQuizQuestions({ role: quizRole, difficulty: quizDifficulty, count: quizCount })
      : [];

  const questionMode: "all" | "bookmarked" | "mastered" =
    first(sp.tersimpan) === "1" ? "bookmarked" : first(sp.dikuasai) === "1" ? "mastered" : "all";

  const questionFilters: QuestionFilters = {
    role: first(sp.peran),
    category: first(sp.topik),
    difficulty: first(sp.tingkat),
    q: first(sp.q),
  };

  const requestedPage = Number.parseInt(first(sp.page) ?? "1", 10);
  const { items, total: filteredTotal, totalPages, page } = await getQuestions(
    questionFilters,
    Number.isNaN(requestedPage) ? 1 : requestedPage,
    { limit: questionMode !== "all" ? 1000 : undefined },
  );

  const hasFilters = Boolean(
    questionFilters.role ||
      questionFilters.category ||
      questionFilters.difficulty ||
      questionFilters.q,
  );

  return (
    <>
      <TopBar />
      <main className="wrap py-12">
        <header className="mb-8">
          <h1 className="mb-3 font-display text-[clamp(32px,5vw,52px)] font-bold leading-[1.05] tracking-[-0.02em]">
            Katalog soal
          </h1>
          <p className="m-0 max-w-[560px] text-[19px] text-mut">
            {total} soal Machine Learning dan AI. Buka soal, jawab sendiri, lalu cek pembahasannya.
          </p>
        </header>

        <nav className="mb-8 flex gap-6 border-b-2 border-line" aria-label="Mode">
          <Link
            href={hrefOf(questionFilters)}
            aria-current={latihanMode ? undefined : "page"}
            className={`-mb-0.5 border-b-4 pb-3 font-display text-lg font-bold transition-colors ${
              latihanMode ? "border-transparent text-mut hover:text-ink" : "border-pri text-ink"
            }`}
          >
            Katalog
          </Link>
          <Link
            href="/soal?mode=latihan"
            aria-current={latihanMode ? "page" : undefined}
            className={`-mb-0.5 border-b-4 pb-3 font-display text-lg font-bold transition-colors ${
              latihanMode ? "border-pri text-ink" : "border-transparent text-mut hover:text-ink"
            }`}
          >
            Latihan
          </Link>
        </nav>

        {latihanMode ? (
          <QuizShell
            key={[quizRole ?? "", quizDifficulty ?? "", String(quizCount ?? "")].join("|")}
            questions={quizQuestions}
            roleOptions={stats.roles}
            total={stats.total}
            requested={hasQuizParams}
            role={quizRole}
            difficulty={quizDifficulty}
            count={quizCount}
          />
        ) : (
          <div className="space-y-8">
            <form action="/soal" className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
              <label className="flex flex-col gap-2 text-sm font-extrabold text-mut">
                Cari
                <input
                  type="search"
                  name="q"
                  defaultValue={questionFilters.q ?? ""}
                  placeholder="contoh: A/B testing, class imbalance"
                  className="field"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-extrabold text-mut">
                Topik
                <select name="topik" defaultValue={questionFilters.category ?? ""} className="field">
                  <option value="">Semua topik</option>
                  {questionOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {titleize(category)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-extrabold text-mut">
                Kesulitan
                <select
                  name="tingkat"
                  defaultValue={questionFilters.difficulty ?? ""}
                  className="field"
                >
                  <option value="">Semua tingkat</option>
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-5 md:col-span-3">
                <button type="submit" className="btn btn-sm">
                  Terapkan
                </button>
                {hasFilters && (
                  <Link href="/soal" className="font-extrabold text-pri">
                    Reset
                  </Link>
                )}
                <span className="ml-auto text-sm text-mut">
                  {filteredTotal} soal
                </span>
              </div>
            </form>

            <RoleFilter roles={questionOptions.roles} filters={questionFilters} />

            <QuestionList
              items={items}
              mode={questionMode}
              total={filteredTotal}
              page={page}
              totalPages={totalPages}
              hrefAll={hrefOf(questionFilters, { tersimpan: undefined, dikuasai: undefined })}
              hrefBookmarked={hrefOf(questionFilters, { tersimpan: "1", page: undefined })}
              hrefMastered={hrefOf(questionFilters, { dikuasai: "1", page: undefined })}
              baseQuery={queryOf(questionFilters)}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}