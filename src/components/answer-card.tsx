"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";

export function AnswerCard({ answer }: { answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card !p-0">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <span className="font-display text-lg font-bold">Pembahasan</span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="btn btn-sm">
          {open ? "Tutup" : "Buka pembahasan"}
        </button>
      </div>
      <div className={`answer-grid ${open ? "open" : ""}`}>
        <div className="answer-inner">
          <div className="border-t-2 border-line p-6">
            <Markdown>{answer}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}