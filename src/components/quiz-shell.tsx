"use client";

import { useState } from "react";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { difficultyLabels, difficultyStyles, titleize } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import type { QuestionListItem as QuizQuestion } from "@/lib/questions";

const DIFFICULTIES = [
  { value: "", label: "Semua tingkat" },
  { value: "easy", label: "Mudah" },
  { value: "medium", label: "Sedang" },
  { value: "hard", label: "Sulit" },
];

const COUNTS = [5, 10, 20, 50, 0];

type Props = {
  questions: QuizQuestion[];
  roleOptions: { value: string; count: number }[];
  total: number;
  requested: boolean;
  role?: string;
  difficulty?: string;
  count?: number;
};

export function QuizShell({
  questions,
  roleOptions,
  total,
  requested,
  role,
  difficulty,
  count,
}: Props) {
  // Filters are a plain GET form, so the session is shareable and back/forward works.
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  const inSession = requested && questions.length > 0 && !finished;
  const current = questions[index];

  if (finished) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          {questions.length} soal selesai.
        </h2>
        <p className="text-sm leading-relaxed text-fg-muted">
          Ulangi sesi yang sama untuk mengukur retensi, atau ganti filter untuk latihan baru.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/?mode=latihan&quizCount=${questions.length}`}
            className="btn-primary px-4 py-2 text-sm"
          >
            Ulangi sesi
          </Link>
          <Link href="/?mode=latihan" className="btn-ghost px-4 py-2 text-sm">
            Ganti filter
          </Link>
        </div>
      </div>
    );
  }

  if (inSession && current) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-fg-muted">
            {String(index + 1).padStart(2, "0")} / {questions.length}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={difficultyStyles[current.difficulty] ?? "badge badge-muted"}>
            {difficultyLabels[current.difficulty] ?? current.difficulty}
          </span>
          <span className="badge badge-muted">{roleLabel(current.role)}</span>
          <span className="badge badge-muted">{titleize(current.category)}</span>
        </div>

        <h2 className="font-display text-xl font-semibold leading-snug text-foreground">
          {current.question}
        </h2>

        <div className="border-t border-border pt-4">
          {open ? (
            <Markdown>{current.answer}</Markdown>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-ghost px-4 py-2 text-sm"
            >
              Lihat jawaban
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => {
              setIndex((value) => Math.max(0, value - 1));
              setOpen(false);
            }}
            disabled={index === 0}
            className="btn-ghost px-4 py-2 text-sm disabled:opacity-40"
          >
            Sebelumnya
          </button>
          {index === questions.length - 1 ? (
            <button type="button" onClick={() => setFinished(true)} className="btn-primary px-4 py-2 text-sm">
              Selesai
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIndex((value) => value + 1);
                setOpen(false);
              }}
              className="btn-primary px-4 py-2 text-sm"
            >
              Berikutnya
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-fg-muted">
        {total} soal tersedia. Jawab sendiri dulu, baru buka pembahasan.
      </p>

      {requested && questions.length === 0 && (
        <p className="text-sm text-fg-soft">Tidak ada soal yang cocok. Longgarkan filter.</p>
      )}

      <form action="/?mode=latihan" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
            Peran
            <select name="quizRole" defaultValue={role ?? ""} className="field px-3 py-2 text-sm">
              <option value="">Semua peran</option>
              {roleOptions.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleLabel(roleOption.value)} ({roleOption.count})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
            Kesulitan
            <select
              name="quizDifficulty"
              defaultValue={difficulty ?? ""}
              className="field px-3 py-2 text-sm"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-fg-muted">
            Jumlah soal
            <select name="quizCount" defaultValue={String(count ?? 10)} className="field px-3 py-2 text-sm">
              {COUNTS.map((n) => (
                <option key={n} value={n === 0 ? "" : n}>
                  {n === 0 ? "Semua" : n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" className="btn-primary px-5 py-2 text-sm">
          Mulai sesi
        </button>
      </form>

      <p className="text-xs text-fg-soft">
        Sesi diacak dari soal yang cocok, jadi urutan berbeda tiap mulai.
      </p>
    </div>
  );
}