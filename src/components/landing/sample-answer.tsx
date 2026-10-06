import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { difficultyLabels } from "@/lib/format";
import type { QuestionListItem } from "@/lib/questions";

const LEVEL_CLASS: Record<string, string> = {
  easy: "badge badge-m",
  medium: "badge badge-s",
  hard: "badge badge-h",
};

// One real question with its real answer. Replaces a section that claimed "three
// layers" while showing a flat block of prose, and replaced a second stack of
// question cards that competed with the catalog.
export function SampleAnswer({
  sample,
  total,
  topicCount,
  roleCount,
}: {
  sample?: QuestionListItem;
  total: number;
  topicCount: number;
  roleCount: number;
}) {
  if (!sample) return null;

  // Every count comes from a query, never hand-typed, and the strip lives inside
  // #tentang rather than above it: an anchor lands 96px down, so a taller section
  // is what keeps the next heading out of the viewport.
  const stats = [
    { value: total, label: "soal" },
    { value: roleCount, label: "peran karier" },
    { value: topicCount, label: "topik" },
  ];

  return (
    <section id="tentang" className="py-[72px]">
      <div className="mb-14 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[20px] bg-soft p-6 text-center">
            <b className="block font-mono text-[34px] leading-none">{stat.value}</b>
            <span className="mt-2 block text-mut">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid items-center gap-14 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-[clamp(34px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
            Jawaban yang<br />
            bisa kamu baca.
          </h2>
          <p className="mb-8 max-w-[560px] text-[19px] text-mut">
            Setiap soal punya pembahasan yang tersusun: rumus, penjelasan kenapa begitu, lalu kode
            yang bisa langsung dijalankan.
          </p>
          <Link href="/soal" className="btn btn-sm">
            Lihat katalog
          </Link>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
            <span className={LEVEL_CLASS[sample.difficulty] ?? "badge badge-soft"}>
              {difficultyLabels[sample.difficulty] ?? sample.difficulty}
            </span>
            <span className="font-extrabold leading-snug text-ink">{sample.question}</span>
          </div>
          <Markdown>{sample.answer}</Markdown>
        </div>
      </div>
    </section>
  );
}