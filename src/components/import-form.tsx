"use client";

import { useActionState, useState } from "react";
import { importQuestions } from "@/app/admin/actions";

// Import takes pasted JSON/CSV, not a one-word answer, so these read as boxes
// rather than the site-wide pill. Overrides .field's 999px radius.
const fieldClass = "field rounded-[12px] px-3 py-3";

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importQuestions, {});
  const [format, setFormat] = useState("json");

  return (
    <form action={formAction} className="space-y-5">
      <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted sm:max-w-xs">
        Format
        <select
          name="format"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
          className={`${fieldClass} sm:py-2`}
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
        File {format.toUpperCase()} (opsional)
        <input
          type="file"
          name="file"
          accept={format === "json" ? ".json,application/json" : ".csv,text/csv"}
          className={`${fieldClass} py-2.5 text-sm`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
        Atau tempel data langsung
        <textarea
          name="data"
          rows={10}
          spellCheck={false}
          placeholder={
            format === "json"
              ? '[{"role":"data-scientist","category":"statistics","difficulty":"medium","question":"...","answer":"...","tags":"a,b"}]'
              : "role,category,difficulty,question,answer,tags"
          }
          className={`${fieldClass} font-mono text-xs sm:py-2`}
        />
      </label>

      {state.error && (
        <p role="alert" className="notice notice-err">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary px-4 py-3 sm:py-2">
        {pending ? "Mengimpor..." : "Impor soal"}
      </button>
    </form>
  );
}