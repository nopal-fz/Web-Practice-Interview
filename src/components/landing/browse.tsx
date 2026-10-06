import Link from "next/link";
import { titleize } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import type { CountByValue } from "@/lib/questions";

// Topics and roles are the same job: two ways to find your way into the catalog.
// Split into two sections they only made the page longer.
export function Browse({
  topics,
  roles,
}: {
  topics: CountByValue[];
  roles: CountByValue[];
}) {
  return (
    <section id="mulai" className="py-[72px]">
      <h2 className="mb-4 font-display text-[clamp(34px,5vw,56px)] font-bold leading-[1.05] tracking-[-0.02em]">
        Mulai dari yang kamu incar.
      </h2>
      <p className="mb-8 max-w-[560px] text-[19px] text-mut">
        Pilih topik yang sedang dibahas di tempat kerja, atau posisi yang kamu lamarkan.
      </p>

      <h3 className="lbl mb-4">Peran</h3>
      <div className="flex flex-wrap gap-3">
        {roles.map((role) => (
          <Link
            key={role.value}
            href={`/soal?peran=${encodeURIComponent(role.value)}`}
            className="pill"
          >
            {roleLabel(role.value)}
          </Link>
        ))}
      </div>

      <h3 className="lbl mt-12 mb-4">Topik</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.value}
            href={`/soal?topik=${encodeURIComponent(topic.value)}`}
            className="card transition-colors hover:border-pri"
          >
            <h4 className="mb-1 font-display text-xl font-bold">{titleize(topic.value)}</h4>
            <p className="m-0 text-mut">
              <span className="font-mono text-sm">{topic.count}</span> soal
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}