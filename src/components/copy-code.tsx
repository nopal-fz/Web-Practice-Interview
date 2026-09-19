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
      className={`inline-flex h-11 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors sm:h-8 sm:px-2.5 ${
        copied
          ? "bg-[var(--badge-easy-bg)] text-[var(--badge-easy-fg)]"
          : "text-[var(--fg-muted)] hover:text-[var(--accent)]"
      }`}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}