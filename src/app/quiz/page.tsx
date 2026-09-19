import type { Metadata } from "next";
import { QuizShell } from "@/components/quiz-shell";
import { getQuizQuestions, getStats } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Latihan",
  alternates: { canonical: "/quiz" },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  role?: string;
  difficulty?: string;
  count?: string;
}>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

export default async function QuizPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const role = first(sp.role);
  const difficulty = first(sp.difficulty);
  const countRaw = Number.parseInt(first(sp.count) ?? "", 10);
  const count = Number.isNaN(countRaw) ? undefined : Math.max(1, Math.min(100, countRaw));

  const hasParams = Boolean(role || difficulty || count);

  const [questions, stats] = await Promise.all([
    hasParams ? getQuizQuestions({ role, difficulty, count }) : Promise.resolve([]),
    getStats(),
  ]);

  return (
    <QuizShell
      questions={questions}
      roleOptions={stats.roles}
      total={stats.total}
      requested={hasParams}
      role={role}
      difficulty={difficulty}
      count={count}
    />
  );
}