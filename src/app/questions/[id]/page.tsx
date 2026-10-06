import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnswerCard } from "@/components/answer-card";
import { TopBar } from "@/components/landing/top-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { SITE_NAME } from "@/lib/site";
import { difficultyLabels, titleize } from "@/lib/format";
import { getQuestion } from "@/lib/questions";
import { roleLabel } from "@/lib/roles";

const LEVEL_CLASS: Record<string, string> = {
  easy: "badge badge-m",
  medium: "badge badge-s",
  hard: "badge badge-h",
};

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
    <>
      <TopBar />
      <main className="wrap py-12">
        <article className="max-w-[720px]">
          <Link href="/soal" className="mb-6 inline-block font-extrabold text-pri">
            &larr; Kembali ke katalog
          </Link>

          <div className="mb-4 flex flex-wrap gap-2">
            <span className={LEVEL_CLASS[question.difficulty] ?? "badge badge-soft"}>
              {difficultyLabels[question.difficulty] ?? question.difficulty}
            </span>
            <span className="badge badge-soft">{roleLabel(question.role)}</span>
            <span className="badge badge-soft">{titleize(question.category)}</span>
          </div>

          <h1 className="mb-8 font-display text-[clamp(28px,4vw,44px)] font-bold leading-[1.15] tracking-[-0.02em]">
            {question.question}
          </h1>

          <AnswerCard answer={question.answer} />

          {question.tags && (
            <div className="mt-8 flex flex-wrap gap-2">
              {question.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="pill !py-1.5 font-mono !text-xs">
                    #{tag}
                  </span>
                ))}
            </div>
          )}

          <p className="mt-8 text-sm text-mut">Terakhir diperbarui {updated}</p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}