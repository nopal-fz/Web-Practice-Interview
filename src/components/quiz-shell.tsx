"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { difficultyLabels, difficultyStyles, titleize } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import type { QuestionListItem as QuizQuestion } from "@/lib/questions";

const DIFFICULTIES = [
  { value: undefined as string | undefined, label: "Semua tingkat" },
  { value: "easy", label: "Mudah" },
  { value: "medium", label: "Sedang" },
  { value: "hard", label: "Sulit" },
];

const COUNT_PRESETS = [
  { value: 5, label: "5 soal" },
  { value: 10, label: "10 soal" },
  { value: 20, label: "20 soal" },
  { value: 50, label: "50 soal" },
  { value: undefined as number | undefined, label: "Semua" },
];

type Props = {
  questions: QuizQuestion[];
  roleOptions: { value: string; count: number }[];
  total: number;
  requested: boolean;
  role?: string;
  difficulty?: string;
  count?: number;
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip px-3 py-2 sm:py-1.5 ${
        active
          ? "border-[var(--accent-btn)] text-[var(--accent)]"
          : "text-[var(--fg-muted)] hover:text-[var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}

export function QuizShell({
  questions,
  roleOptions,
  total,
  requested,
  role,
  difficulty,
  count,
}: Props) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | undefined>(role);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(difficulty);
  const [selectedCount, setSelectedCount] = useState<number | undefined>(count);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  function start() {
    const params = new URLSearchParams();
    if (selectedRole) params.set("role", selectedRole);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
    if (selectedCount) params.set("count", String(selectedCount));
    router.push(`/quiz${params.size > 0 ? `?${params.toString()}` : ""}`);
  }

  const inSession = requested && questions.length > 0 && !finished;
  const current = questions[index];
  const done = (index: number) => String(index + 1).padStart(2, "0");
  const totalDone = String(questions.length).padStart(2, "0");

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <p className="eyebrow">Sesi selesai</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Sesi latihan selesai.</h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--fg-muted)]">
          {questions.length} soal diulang lewat flashcard. Sampai jumpa di sesi berikutnya.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/quiz?count=${questions.length}`} className="btn-primary px-4 py-3 sm:py-2">
            Ulangi
          </Link>
          <Link href="/quiz" className="btn-ghost px-4 py-3 sm:py-2">
            Pilih ulang
          </Link>
        </div>
      </div>
    );
  }

  if (inSession && current) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <p className="eyebrow">
          Sesi latihan · {done(index)} / {totalDone}
        </p>

        <article className="card overflow-hidden">
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={difficultyStyles[current.difficulty] ?? "badge badge-muted"}>
                {difficultyLabels[current.difficulty] ?? current.difficulty}
              </span>
              <span className="badge badge-muted">{roleLabel(current.role)}</span>
              <span className="badge badge-muted">{titleize(current.category)}</span>
            </div>
            <h1 className="font-display mt-4 text-xl font-semibold tracking-tight leading-snug sm:text-2xl">
              {current.question}
            </h1>
          </div>

          <div className="hairline flex items-center justify-between gap-3 px-5 py-3">
            <span className="text-sm font-medium">Jawaban</span>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="btn-ghost px-3 py-2 text-xs sm:py-1"
            >
              {open ? "Sembunyikan" : "Lihat jawaban"}
            </button>
          </div>
          <div className={`answer-grid ${open ? "open" : ""}`}>
            <div className="answer-inner">
              <div className="px-5 py-4 sm:px-6">
                <Markdown>{current.answer}</Markdown>
              </div>
            </div>
          </div>
        </article>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setIndex((value) => Math.max(0, value - 1));
              setOpen(false);
            }}
            disabled={index === 0}
            className="btn-ghost px-4 py-3 text-sm sm:py-2 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          {index === questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setFinished(true)}
              className="btn-primary px-4 py-3 sm:py-2"
            >
              Selesai
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIndex((value) => value + 1);
                setOpen(false);
              }}
              className="btn-primary px-4 py-3 sm:py-2"
            >
              Berikutnya
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <p className="eyebrow">Sesi latihan</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Buat sesi latihanmu.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--fg-muted)]">
          {total} soal tersedia. Pilih role, tingkat kesulitan, dan jumlah soal, lalu mulai
          flashcard-nya.
        </p>
      </div>

      {requested && questions.length === 0 && (
        <div className="panel px-5 py-4 text-sm text-[var(--fg-muted)]">
          Belum ada soal yang cocok dengan pilihan ini. Coba longgarkan filternya.
        </div>
      )}

      <div className="card space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--fg-muted)]">Role</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={selectedRole === undefined} onClick={() => setSelectedRole(undefined)}>
              Semua role
            </Chip>
            {roleOptions.map((roleOption) => (
              <Chip
                key={roleOption.value}
                active={selectedRole === roleOption.value}
                onClick={() => setSelectedRole(roleOption.value)}
              >
                {roleLabel(roleOption.value)}
                <span className="tabular-nums text-[var(--fg-soft)]">{roleOption.count}</span>
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--fg-muted)]">Tingkat kesulitan</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d.label}
                active={selectedDifficulty === d.value}
                onClick={() => setSelectedDifficulty(d.value)}
              >
                {d.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--fg-muted)]">Jumlah soal</p>
          <div className="flex flex-wrap gap-2">
            {COUNT_PRESETS.map((c) => (
              <Chip
                key={c.label}
                active={selectedCount === c.value}
                onClick={() => setSelectedCount(c.value)}
              >
                {c.label}
              </Chip>
            ))}
          </div>
        </div>

        <button type="button" onClick={start} className="btn-primary w-full px-4 py-3 sm:w-auto sm:py-2">
          Mulai latihan
        </button>
      </div>
    </div>
  );
}