"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { BookmarkIcon, CheckIcon, ChevronIcon, LinkIcon } from "@/components/icons";
import { difficultyLabels, difficultyStyles, titleize } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import type { QolSet } from "@/lib/qol";
import type { QuestionListItem as Item } from "@/lib/questions";
import { copyText } from "@/lib/clipboard";

// Flat row, not a card: the list already has hairlines between rows, so a bordered
// box per question doubled the structure and made the page look busy.
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
    "inline-flex min-h-[36px] items-center gap-1.5 rounded border px-2.5 text-xs transition-colors";

  return (
    <li className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start gap-3 py-3.5 text-left"
      >
        <span className={`${difficultyStyles[item.difficulty] ?? "badge badge-muted"} shrink-0`}>
          {difficultyLabels[item.difficulty] ?? item.difficulty}
        </span>
        <span
          className={`min-w-0 flex-1 text-sm leading-relaxed ${
            done ? "text-fg-soft line-through" : "text-foreground"
          }`}
        >
          {item.question}
        </span>
        <ChevronIcon
          className={`mt-1 shrink-0 transition-transform ${
            open ? "rotate-180 text-accent-text" : "text-fg-soft"
          }`}
        />
      </button>

      <div className={`answer-grid ${open ? "open" : ""}`}>
        <div className="answer-inner">
          <div className="pb-4 pl-0 sm:pl-[4.75rem]">
            <Markdown>{item.answer}</Markdown>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge badge-muted">{roleLabel(item.role)}</span>
              <span className="badge badge-muted">{titleize(item.category)}</span>
              {item.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="font-mono text-[11px] text-fg-soft">
                    #{tag}
                  </span>
                ))}
              <span className="flex basis-full flex-wrap items-center gap-2 sm:basis-auto sm:ml-auto">
                <button
                  type="button"
                  onClick={() => bookmarks.toggle(item.id)}
                  aria-pressed={saved}
                  className={`${action} ${
                    saved
                      ? "border-primary-accent bg-primary-accent/10 text-accent-text"
                      : "border-border text-fg-muted hover:border-primary-accent hover:text-foreground"
                  }`}
                >
                  <BookmarkIcon className={`size-3 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Tersimpan" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => mastered.toggle(item.id)}
                  aria-pressed={done}
                  className={`${action} ${
                    done
                      ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                      : "border-border text-fg-muted hover:border-accent-blue hover:text-foreground"
                  }`}
                >
                  <CheckIcon className="size-3" />
                  {done ? "Dikuasai" : "Dikuasai?"}
                </button>
                <button
                  type="button"
                  onClick={share}
                  aria-live="polite"
                  className={`${action} ${
                    copied
                      ? "border-primary-accent text-accent-text"
                      : "border-border text-fg-muted hover:border-primary-accent hover:text-foreground"
                  }`}
                >
                  <LinkIcon className="size-3" />
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

