"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { BookmarkIcon, CheckIcon, ChevronIcon, LinkIcon } from "@/components/icons";
import { difficultyLabels } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import type { QolSet } from "@/lib/qol";
import type { QuestionListItem as Item } from "@/lib/questions";
import { copyText } from "@/lib/clipboard";

const LEVEL_CLASS: Record<string, string> = {
  easy: "badge badge-m",
  medium: "badge badge-s",
  hard: "badge badge-h",
};

export function QuestionListItem({
  item,
  bookmarks,
  mastered,
}: {
  item: Item;
  bookmarks: QolSet;
  mastered: QolSet;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const saved = bookmarks.has(item.id);
  const done = mastered.has(item.id);

  async function share() {
    await copyText(`${window.location.origin}/questions/${item.id}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const action =
    "inline-flex min-h-[40px] items-center gap-2 rounded-full border-2 px-4 text-sm font-extrabold transition-colors";

  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start gap-4 px-6 py-5 text-left"
      >
        <span className={`${LEVEL_CLASS[item.difficulty] ?? "badge badge-soft"} shrink-0`}>
          {difficultyLabels[item.difficulty] ?? item.difficulty}
        </span>
        <span
          className={`min-w-0 flex-1 text-[17px] font-bold leading-snug ${
            done ? "text-mut line-through" : "text-ink"
          }`}
        >
          {item.question}
        </span>
        <ChevronIcon
          className={`mt-1.5 size-3 shrink-0 transition-transform ${
            open ? "rotate-180 text-pri" : "text-mut"
          }`}
        />
      </button>

      <div className={`answer-grid ${open ? "open" : ""}`}>
        <div className="answer-inner">
          <div className="px-6 pb-6">
            <div className="rounded-[16px] bg-soft p-5">
              <Markdown>{item.answer}</Markdown>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="badge badge-soft">{roleLabel(item.role)}</span>
              {item.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="font-mono text-xs text-mut">
                    #{tag}
                  </span>
                ))}
              <span className="flex basis-full flex-wrap items-center gap-2 sm:ml-auto sm:basis-auto">
                <button
                  type="button"
                  onClick={() => bookmarks.toggle(item.id)}
                  aria-pressed={saved}
                  className={`${action} ${
                    saved
                      ? "border-pri bg-pri/10 text-pri"
                      : "border-line text-mut hover:border-pri hover:text-ink"
                  }`}
                >
                  <BookmarkIcon className={`size-3.5 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Tersimpan" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => mastered.toggle(item.id)}
                  aria-pressed={done}
                  className={`${action} ${
                    done
                      ? "border-pri bg-pri/10 text-pri"
                      : "border-line text-mut hover:border-pri hover:text-ink"
                  }`}
                >
                  <CheckIcon className="size-3.5" />
                  {done ? "Dikuasai" : "Dikuasai?"}
                </button>
                <button
                  type="button"
                  onClick={share}
                  aria-live="polite"
                  className={`${action} ${
                    copied ? "border-pri text-pri" : "border-line text-mut hover:border-pri hover:text-ink"
                  }`}
                >
                  <LinkIcon className="size-3.5" />
                  {copied ? "Tersalin" : "Tautan"}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}