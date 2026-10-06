"use client";

import { useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { CheckIcon, CopyIcon } from "@/components/icons";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  async function handleCopy() {
    await copyText(code);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors ${
        copied ? "text-[var(--okt)]" : "text-fg-muted hover:text-ink"
      }`}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}