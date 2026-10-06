import { notFound } from "next/navigation";
import { QuestionForm } from "@/components/question-form";
import { getFilterOptions, getQuestion } from "@/lib/questions";

export const metadata = { title: "Ubah soal" };

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // includeAll: an admin must be able to reopen a draft or an archived row,
  // otherwise a soft-deleted question could never be reviewed or restored.
  const [question, options] = await Promise.all([
    getQuestion(id, { includeAll: true }),
    getFilterOptions(true),
  ]);

  if (!question) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Ubah soal</h1>
      <QuestionForm
        question={{
          id: question.id,
          role: question.role,
          category: question.category,
          difficulty: question.difficulty,
          question: question.question,
          answer: question.answer,
          tags: question.tags,
          topic: question.topic,
          keyConcepts: question.keyConcepts,
          status: question.status,
        }}
        roles={options.roles}
        categories={options.categories}
        topics={options.topics}
      />
    </div>
  );
}
