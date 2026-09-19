"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";

export function AnswerCard({ answer }: { answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="hairline flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-medium">Jawaban</span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="btn-ghost px-3 py-2 text-xs sm:py-1"
        >
          <Chevron className={open ? "rotate-180" : ""} />
          {open ? "Sembunyikan" : "Lihat jawaban"}
        </button>
      </div>
      <div className={`answer-grid ${open ? "open" : ""}`}>
        <div className="answer-inner">
          <div className="px-4 py-4 sm:px-5">
            <Markdown>{answer}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}