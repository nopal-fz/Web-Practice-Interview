import { ImportForm } from "@/components/import-form";

export const metadata = { title: "Import soal" };

type SearchParams = Promise<{ imported?: string; skipped?: string }>;

export default async function ImportPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const imported = Number.parseInt(sp.imported ?? "", 10);
  const skipped = Number.parseInt(sp.skipped ?? "", 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Import soal</h1>
        <p className="text-sm text-fg-muted">
          Unggah file atau tempel data JSON/CSV. Soal langsung ditambahkan tanpa menimpa data lama.
        </p>
      </div>

      {!Number.isNaN(imported) && (
        <p
          role="status"
          className="rounded border px-3 py-2 text-sm text-fg"
          style={{ borderColor: "var(--success)", background: "var(--badge-easy-bg)" }}
        >
          {imported} soal berhasil diimpor
          {!Number.isNaN(skipped) && skipped > 0 ? `, ${skipped} baris dilewati.` : "."}
        </p>
      )}

      <ImportForm />

      <section className="card space-y-3 p-4 text-sm text-fg-muted">
        <h2 className="font-display text-base font-semibold tracking-tight">Format data</h2>
        <p>
          Field wajib: <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">role</code>,{" "}
          <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">category</code>,{" "}
          <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">question</code>,{" "}
          <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">answer</code>. Field opsional:{" "}
          <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">difficulty</code> (easy/medium/hard, default
          medium) dan <code className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-xs">tags</code>.
        </p>
        <p>JSON: array soal, atau objek dengan field &quot;questions&quot; berisi array.</p>
        <pre className="prose-answer overflow-x-auto">{`[
  {
    "role": "data-scientist",
    "category": "statistics",
    "difficulty": "medium",
    "question": "Apa itu p-value?",
    "answer": "Penjelasan **markdown** di sini.",
    "tags": "statistik, hipotesis"
  }
]`}</pre>
        <p>CSV: baris pertama berisi nama kolom, gunakan kolom yang sama seperti di atas.</p>
        <pre className="prose-answer overflow-x-auto">{`role,category,difficulty,question,answer,tags
data-scientist,statistics,medium,"Apa itu p-value?","Penjelasan markdown.","statistik, hipotesis"`}</pre>
      </section>
    </div>
  );
}