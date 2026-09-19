"use client";

import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { QuestionListItem } from "@/components/question-list-item";
import { BOOKMARK_KEY, MASTERED_KEY, useQolSet } from "@/lib/qol";
import type { QuestionListItem as Item } from "@/lib/questions";

type Props = {
  items: Item[];
  mode: "all" | "bookmarked";
  total: number;
  page: number;
  totalPages: number;
  hrefAll: string;
  hrefBookmarked: string;
  baseQuery: string;
};

function TabLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  const idle =
    "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]";
  const activeClass = "border-[var(--accent-btn)] bg-[var(--accent-btn)] text-[var(--accent-on)]";
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`inline-flex h-11 items-center rounded-lg border px-4 text-sm font-medium transition-colors sm:h-9 ${
        active ? activeClass : idle
      }`}
    >
      {label}
    </Link>
  );
}

export function QuestionList({
  items,
  mode,
  total,
  page,
  totalPages,
  hrefAll,
  hrefBookmarked,
  baseQuery,
}: Props) {
  const bookmarks = useQolSet(BOOKMARK_KEY);
  const mastered = useQolSet(MASTERED_KEY);

  const shown = mode === "bookmarked" ? items.filter((item) => bookmarks.has(item.id)) : items;

  const hrefFor = (target: number) =>
    `/questions?${baseQuery}${baseQuery ? "&" : ""}page=${String(target)}`;

  const empty =
    mode === "bookmarked" ? (
      bookmarks.count === 0 ? (
        <EmptyState
          title="Belum ada soal yang tersimpan."
          description="Tekan Simpan pada kartu soal untuk mem-bookmark latihan. Tab Tersimpan menampilkan soal yang kamu simpan."
          actionHref={hrefAll}
          actionLabel="Lihat semua soal"
        />
      ) : (
        <EmptyState
          title="Tidak ada soal tersimpan yang cocok dengan filter."
          description="Beberapa soal tersimpan tidak tampil di filter aktif."
          actionHref={hrefAll}
          actionLabel="Lihat semua tersimpan"
        />
      )
    ) : (
      <EmptyState
        title="Tidak ada soal yang cocok."
        description="Coba longgarkan filter atau mulai dari kumpulan soal."
        actionHref="/questions"
        actionLabel="Reset semua filter"
      />
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Daftar soal">
        <TabLink href={hrefAll} active={mode === "all"} label="Semua" />
        <TabLink
          href={hrefBookmarked}
          active={mode === "bookmarked"}
          label={`Tersimpan (${bookmarks.count})`}
        />
        {mode === "bookmarked" && shown.length > 0 && (
          <p className="eyebrow ml-auto">
            {shown.length} dari {total} soal yang cocok tersimpan
          </p>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="px-1">{empty}</div>
      ) : (
        <ul className="card lines">
          {shown.map((item) => (
            <QuestionListItem
              key={item.id}
              item={item}
              bookmarks={bookmarks}
              mastered={mastered}
            />
          ))}
        </ul>
      )}

      {mode === "all" && <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />}
    </div>
  );
}