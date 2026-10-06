"use client";

import { useActionState, useState } from "react";
import { saveQuestion } from "@/app/admin/actions";
import { Markdown } from "@/components/markdown";
import { FIELD_LIMITS } from "@/lib/format";

export type EditableQuestion = {
  id: string;
  role: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string;
};

const fieldClass = "field px-3 py-3 text-sm sm:py-2";

export function QuestionForm({
  question,
  roles,
  categories,
}: {
  question?: EditableQuestion;
  roles: string[];
  categories: string[];
}) {
  const [state, formAction, pending] = useActionState(saveQuestion, {});
  const [answer, setAnswer] = useState(question?.answer ?? "");
  const [preview, setPreview] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {question && <input type="hidden" name="id" value={question.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
          Role
          <input
            type="text"
            name="role"
            list="role-options"
            required
            maxLength={FIELD_LIMITS.role}
            defaultValue={question?.role}
            placeholder="data-scientist"
            className={fieldClass}
          />
          <datalist id="role-options">
            {roles.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
          Topik
          <input
            type="text"
            name="category"
            list="category-options"
            required
            maxLength={FIELD_LIMITS.category}
            defaultValue={question?.category}
            placeholder="statistics"
            className={fieldClass}
          />
          <datalist id="category-options">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
          Tingkat kesulitan
          <select name="difficulty" defaultValue={question?.difficulty ?? "medium"} className={fieldClass}>
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
        Pertanyaan
        <textarea name="question" required rows={2} maxLength={FIELD_LIMITS.question} defaultValue={question?.question} className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
        Tags (pisahkan dengan koma)
        <input
          type="text"
          name="tags"
          maxLength={FIELD_LIMITS.tags}
          defaultValue={question?.tags}
          placeholder="query, aggregation, window-function"
          className={fieldClass}
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-fg-muted">Jawaban (markdown)</span>
          <button
            type="button"
            onClick={() => setPreview((value) => !value)}
            className="btn-ghost px-3 py-2 text-xs sm:py-1"
          >
            {preview ? "Tulis" : "Preview"}
          </button>
        </div>

        {preview ? (
          <div className="card px-4 py-3">
            <Markdown>{answer || "_Belum ada jawaban._"}</Markdown>
          </div>
        ) : (
          <textarea
            name="answer"
            required
            rows={12}
            maxLength={FIELD_LIMITS.answer}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className={`${fieldClass} w-full font-mono`}
          />
        )}
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded border px-3 py-2 text-sm text-fg"
          style={{ borderColor: "var(--hardt)", background: "var(--hard)" }}
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary px-4 py-3 sm:py-2">
          {pending ? "Menyimpan..." : question ? "Simpan perubahan" : "Tambah soal"}
        </button>
      </div>
    </form>
  );
}