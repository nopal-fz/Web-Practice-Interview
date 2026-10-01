import Link from "next/link";
import { getTotalCount, getQuizQuestions, getStats, getQuestions, getFilterOptions } from "@/lib/questions";
import { buildQuery, titleize } from "@/lib/format";
import { QuizShell } from "@/components/quiz-shell";
import { QuestionList } from "@/components/question-list";
import { roleLabel } from "@/lib/roles";
import type { QuestionFilters } from "@/lib/questions";

export const dynamic = "force-dynamic";

type SearchParams = {
  mode?: string;
  quizRole?: string;
  quizDifficulty?: string;
  quizCount?: string;
  questionRole?: string;
  questionCategory?: string;
  questionDifficulty?: string;
  questionQ?: string;
  questionPage?: string;
  questionBookmarked?: string;
  questionMastered?: string;
};

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

function RoleFilter({ roles, filters }: { roles: string[]; filters: QuestionFilters }) {
  const all = [{ role: undefined }, ...roles.map((role) => ({ role }))];
  return (
    <div className="role-scroller">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {all.map(({ role }) => {
          const query = buildQuery({ ...filters, questionRole: role, questionPage: undefined });
          return (
            <li key={role ?? "all"}>
              <Link
                href={query ? `/?${query}` : "/"}
                aria-current={filters.role === role ? "true" : undefined}
                className="chip px-3 py-1.5 text-sm"
              >
                {role ? roleLabel(role) : "Semua peran"}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const latihanMode = first(sp.mode) === "latihan";

  const [total, stats, questionOptions] = await Promise.all([
    getTotalCount(),
    getStats(),
    getFilterOptions(),
  ]);

  const quizRole = first(sp.quizRole);
  const quizDifficulty = first(sp.quizDifficulty);
  const countRaw = Number.parseInt(first(sp.quizCount) ?? "", 10);
  const quizCount = Number.isNaN(countRaw) ? undefined : Math.max(1, Math.min(100, countRaw));
  const hasQuizParams = Boolean(quizRole || quizDifficulty || quizCount);
  const quizQuestions = latihanMode && hasQuizParams
    ? await getQuizQuestions({ role: quizRole, difficulty: quizDifficulty, count: quizCount })
    : [];

  const questionMode: "all" | "bookmarked" | "mastered" =
    first(sp.questionBookmarked) === "1"
      ? "bookmarked"
      : first(sp.questionMastered) === "1"
      ? "mastered"
      : "all";
  const questionFilters = {
    role: first(sp.questionRole),
    category: first(sp.questionCategory),
    difficulty: first(sp.questionDifficulty),
    q: first(sp.questionQ),
  };
  const requestedQuestionPage = Number.parseInt(first(sp.questionPage) ?? "1", 10);

  const { items, total: filteredTotal, totalPages, page } = await getQuestions(
    questionFilters,
    Number.isNaN(requestedQuestionPage) ? 1 : requestedQuestionPage,
    { limit: questionMode !== "all" ? 1000 : undefined },
  );

  const hasFilters = Boolean(
    questionFilters.role || questionFilters.category || questionFilters.difficulty || questionFilters.q,
  );
  const baseQuery = buildQuery(questionFilters);

  const hrefAll = `/?${buildQuery({
    ...questionFilters,
    questionBookmarked: undefined,
    questionMastered: undefined,
  })}`;
  const hrefBookmarked = `/?${buildQuery({ ...questionFilters, questionBookmarked: "1", questionPage: undefined })}`;
  const hrefMastered = `/?${buildQuery({ ...questionFilters, questionMastered: "1", questionPage: undefined })}`;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Soal interview Machine Learning dan AI
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          {total} soal dengan pembahasan bertingkat: rumus, intuition, dan kode yang bisa langsung
          dijalankan.
        </p>
      </header>

      <nav className="flex gap-5 border-b border-border" aria-label="Mode">
        <Link
          href="/"
          aria-current={latihanMode ? undefined : "page"}
          className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors ${
            latihanMode
              ? "border-transparent text-fg-muted hover:text-foreground"
              : "border-primary-accent text-foreground"
          }`}
        >
          Katalog
        </Link>
        <Link
          href="/?mode=latihan"
          aria-current={latihanMode ? "page" : undefined}
          className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors ${
            latihanMode
              ? "border-primary-accent text-foreground"
              : "border-transparent text-fg-muted hover:text-foreground"
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
        <div className="space-y-6">
          <form action="/" method="get" className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
              Cari
              <input
                type="search"
                name="questionQ"
                defaultValue={questionFilters.q ?? ""}
                placeholder="Kata kunci atau tag"
                className="field px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
              Topik
              <select
                name="questionCategory"
                defaultValue={questionFilters.category ?? ""}
                className="field px-3 py-2 text-sm"
              >
                <option value="">Semua topik</option>
                {questionOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {titleize(category)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
              Kesulitan
              <select
                name="questionDifficulty"
                defaultValue={questionFilters.difficulty ?? ""}
                className="field px-3 py-2 text-sm"
              >
                <option value="">Semua tingkat</option>
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sulit</option>
              </select>
            </label>

            <div className="flex items-center gap-3 sm:col-span-3">
              <button type="submit" className="btn-primary px-4 py-2 text-sm">
                Terapkan
              </button>
              {hasFilters && (
                <Link href="/" className="link-accent text-sm">
                  Reset
                </Link>
              )}
              <span className="ml-auto text-xs text-fg-soft">
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
            hrefAll={hrefAll}
            hrefBookmarked={hrefBookmarked}
            hrefMastered={hrefMastered}
            baseQuery={baseQuery}
          />
        </div>
      )}
    </div>
  );
}