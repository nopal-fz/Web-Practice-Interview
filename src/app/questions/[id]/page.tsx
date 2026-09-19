import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnswerCard } from "@/components/answer-card";
import { SITE_NAME } from "@/lib/site";
import { difficultyLabels, difficultyStyles, titleize } from "@/lib/format";
import { getQuestion } from "@/lib/questions";
import { roleLabel } from "@/lib/roles";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) return {};

  const excerpt = question.answer
    .replace(/[*_#>`[\]()]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const trimmed =
    excerpt.length > 160 ? `${excerpt.slice(0, 159).replace(/\s+\S*$/, "")}…` : excerpt;

  return {
    title: question.question.slice(0, 70).trim(),
    description: trimmed,
    alternates: { canonical: `/questions/${id}` },
    openGraph: {
      title: question.question,
      description: trimmed,
      type: "article",
      url: `/questions/${id}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary",
      title: question.question,
      description: trimmed,
    },
  };
}

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = await params;
  const question = await getQuestion(id);

  if (!question) {
    notFound();
  }

  const updated = new Date(question.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/questions" className="link-accent inline-block text-sm">
        Kembali ke daftar soal
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={difficultyStyles[question.difficulty] ?? "badge badge-muted"}>
            {difficultyLabels[question.difficulty] ?? question.difficulty}
          </span>
          <span className="badge badge-muted">{roleLabel(question.role)}</span>
          <span className="badge badge-muted">{titleize(question.category)}</span>
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight leading-snug sm:text-3xl">
          {question.question}
        </h1>
      </header>

      <AnswerCard answer={question.answer} />

      {question.tags && (
        <div className="flex flex-wrap gap-2 text-xs">
          {question.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .map((tag) => (
              <span key={tag} className="chip px-2 py-0.5">
                #{tag}
              </span>
            ))}
        </div>
      )}

      <p className="text-xs text-[var(--fg-soft)]">Terakhir diperbarui {updated}</p>
    </article>
  );
}