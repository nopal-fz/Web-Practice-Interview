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
  const [question, options] = await Promise.all([getQuestion(id), getFilterOptions()]);

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
        }}
        roles={options.roles}
        categories={options.categories}
      />
    </div>
  );
}
