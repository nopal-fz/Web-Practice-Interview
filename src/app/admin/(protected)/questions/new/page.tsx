import { QuestionForm } from "@/components/question-form";
import { getFilterOptions } from "@/lib/questions";

export const metadata = { title: "Tambah soal" };

export default async function NewQuestionPage() {
  const options = await getFilterOptions();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Tambah soal</h1>
      <QuestionForm roles={options.roles} categories={options.categories} />
    </div>
  );
}
