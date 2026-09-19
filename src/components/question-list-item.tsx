"use client";

import { useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { BookmarkIcon, CheckIcon, ChevronIcon, LinkIcon } from "@/components/icons";
import { difficultyLabels, difficultyStyles, titleize } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import type { QolSet } from "@/lib/qol";
import type { QuestionListItem as Item } from "@/lib/questions";
import { copyText } from "@/lib/clipboard";

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
  const timer = useRef<number | undefined>(undefined);
  const saved = bookmarks.has(item.id);
  const done = mastered.has(item.id);
  const shareHref = `/questions/${item.id}`;

  async function share() {
    await copyText(`${window.location.origin}${shareHref}`);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <li>
      <div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left"
        >
          <span className={difficultyStyles[item.difficulty] ?? "badge badge-muted"}>
            {difficultyLabels[item.difficulty] ?? item.difficulty}
          </span>
          <span
            className={`min-w-0 flex-1 text-[0.9375rem] font-medium leading-snug transition-colors ${
              done
                ? "text-[var(--fg-soft)] line-through decoration-[var(--border-strong)]"
                : ""
            }`}
          >
            {item.question}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--fg-soft)] group-open:text-[var(--accent)]">
            <ChevronIcon className={`transition-transform ${open ? "rotate-180" : ""}`} />
            <span>{open ? "Tutup" : "Lihat jawaban"}</span>
          </span>
        </button>

        <div className={`answer-grid ${open ? "open" : ""}`}>
          <div className="answer-inner">
            <div className="hairline px-4 py-4 sm:px-5">
              <Markdown>{item.answer}</Markdown>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="badge badge-muted">{roleLabel(item.role)}</span>
                <span className="badge badge-muted">{titleize(item.category)}</span>
                {item.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span key={tag} className="text-[var(--fg-soft)]">
                      #{tag}
                    </span>
                  ))}
                <div className="ml-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => bookmarks.toggle(item.id)}
                    aria-pressed={saved}
                    className={`inline-flex h-11 items-center gap-1.5 rounded-lg border px-3 text-xs transition-colors sm:h-8 ${
                      saved
                        ? "border-[var(--accent-btn)] text-[var(--accent)]"
                        : "border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <BookmarkIcon className={`size-3.5 ${saved ? "fill-current" : ""}`} />
                    {saved ? "Tersimpan" : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => mastered.toggle(item.id)}
                    aria-pressed={done}
                    className={`inline-flex h-11 items-center gap-1.5 rounded-lg border px-3 text-xs transition-colors sm:h-8 ${
                      done
                        ? "border-[var(--accent-btn)] bg-[var(--surface-muted)] text-[var(--accent)]"
                        : "border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <CheckIcon className="size-3.5" />
                    {done ? "Dikuasai" : "Dikuasai?"}
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    aria-live="polite"
                    className={`inline-flex h-11 items-center gap-1.5 rounded-lg border px-3 text-xs transition-colors sm:h-8 ${
                      copied
                        ? "border-[var(--badge-easy-bg)] text-[var(--badge-easy-fg)]"
                        : "border-[var(--border-strong)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <LinkIcon className="size-3.5" />
                    {copied ? "Tersalin" : "Bagikan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}