"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";

export function AnswerCard({ answer }: { answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-medium text-foreground">Pembahasan</span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="btn-ghost px-3 py-2 text-xs"
        >
          {open ? "Sembunyikan" : "Lihat pembahasan"}
        </button>
      </div>
      <div className={`answer-grid ${open ? "open" : ""}`}>
        <div className="answer-inner">
          <div className="border-t border-border bg-surface-muted p-4 sm:p-5">
            <Markdown>{answer}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
