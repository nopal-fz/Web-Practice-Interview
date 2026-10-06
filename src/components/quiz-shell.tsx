"use client";

import { useState } from "react";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { difficultyLabels } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import type { QuestionListItem as QuizQuestion } from "@/lib/questions";

const DIFFICULTIES = [
  { value: "", label: "Semua tingkat" },
  { value: "easy", label: "Mudah" },
  { value: "medium", label: "Sedang" },
  { value: "hard", label: "Sulit" },
];

const LEVEL_CLASS: Record<string, string> = {
  easy: "badge badge-m",
  medium: "badge badge-s",
  hard: "badge badge-h",
};

// "Semua" is -1, not 0. A 0 in the form sent an empty value, which parsed to
// undefined and made the session look like it was never requested.
const COUNTS = [5, 10, 20, 50, -1];

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
  // Filters are a plain GET form, so a session is shareable and back/forward works.
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  const inSession = requested && questions.length > 0 && !finished;
  const current = questions[index];

  // Carry the whole filter set, not just the length. Repeating a session with a
// different role or difficulty is a different session, and the length alone was
// also lossy: a "Semua" run repeats as its exact number, which is not one of
// the count options, so the select came back showing the wrong value.
const repeatParams = new URLSearchParams({ mode: "latihan" });
if (role) repeatParams.set("quizRole", role);
if (difficulty) repeatParams.set("quizDifficulty", difficulty);
repeatParams.set("quizCount", count === undefined ? "all" : String(count));

  if (finished) {
    return (
      <div className="card max-w-[560px]">
        <h2 className="mb-3 font-display text-2xl font-bold">
          {questions.length} soal selesai.
        </h2>
        <p className="mb-6 mt-0 text-mut">
          Ulangi sesi yang sama untuk mengukur retensi, atau ganti filter untuk latihan baru.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/soal?${repeatParams.toString()}`}
            className="btn btn-sm"
          >
            Ulangi sesi
          </Link>
          <Link href="/soal?mode=latihan" className="pill">
            Ganti filter
          </Link>
        </div>
      </div>
    );
  }

  if (inSession && current) {
    return (
      <div className="max-w-[720px]">
        <div className="mb-6 flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-mut">
            {String(index + 1).padStart(2, "0")} / {questions.length}
          </span>
          <span className="h-0.5 flex-1 bg-line" />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className={LEVEL_CLASS[current.difficulty] ?? "badge badge-soft"}>
            {difficultyLabels[current.difficulty] ?? current.difficulty}
          </span>
          <span className="badge badge-soft">{roleLabel(current.role)}</span>
        </div>

        <h2 className="mb-6 font-display text-[clamp(24px,3vw,34px)] font-bold leading-[1.2]">
          {current.question}
        </h2>

        <div className="mb-8 border-t-2 border-line pt-6">
          {open ? (
            <div className="rounded-[20px] bg-soft p-6">
              <Markdown>{current.answer}</Markdown>
            </div>
          ) : (
            <button type="button" onClick={() => setOpen(true)} className="btn">
              Lihat jawaban
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-line pt-6">
          <button
            type="button"
            onClick={() => {
              setIndex((value) => Math.max(0, value - 1));
              setOpen(false);
            }}
            disabled={index === 0}
            className="pill disabled:opacity-40"
          >
            Sebelumnya
          </button>
          {index === questions.length - 1 ? (
            <button type="button" onClick={() => setFinished(true)} className="btn">
              Selesai
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIndex((value) => value + 1);
                setOpen(false);
              }}
              className="btn"
            >
              Berikutnya
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px]">
      <p className="mb-6 max-w-[560px] text-[19px] text-mut">
        {total} soal tersedia. Jawab sendiri dulu, baru buka pembahasan.
      </p>

      {requested && questions.length === 0 && (
        <p className="mb-6 text-mut">Tidak ada soal yang cocok. Longgarkan filter.</p>
      )}

      <form action="/soal" className="card">
        {/* Hidden, not a query on the action: a GET form replaces the action's
            query string with its own fields, so "?mode=latihan" was silently
            dropped and "Mulai sesi" landed back on the catalog. */}
        <input type="hidden" name="mode" value="latihan" />

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-extrabold text-mut">
            Peran
            <select name="quizRole" defaultValue={role ?? ""} className="field">
              <option value="">Semua peran</option>
              {roleOptions.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleLabel(roleOption.value)} ({roleOption.count})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-extrabold text-mut">
            Kesulitan
            <select name="quizDifficulty" defaultValue={difficulty ?? ""} className="field">
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-extrabold text-mut">
            Jumlah soal
            <select name="quizCount" defaultValue={String(count ?? 10)} className="field">
              {COUNTS.map((n) => (
                <option key={n} value={n === -1 ? "all" : n}>
                  {n === -1 ? "Semua" : n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit" className="btn mt-6">
          Mulai sesi
        </button>

        <p className="mb-0 mt-4 text-sm text-mut">
          Sesi diacak dari soal yang cocok, jadi urutan berbeda tiap mulai.
        </p>
      </form>
    </div>
  );
}