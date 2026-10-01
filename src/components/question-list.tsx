"use client";

import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import { QuestionListItem } from "@/components/question-list-item";
import { BOOKMARK_KEY, MASTERED_KEY, useQolSet } from "@/lib/qol";
import type { QuestionListItem as Item } from "@/lib/questions";

type Props = {
  items: Item[];
  mode: "all" | "bookmarked" | "mastered";
  total: number;
  page: number;
  totalPages: number;
  hrefAll: string;
  hrefBookmarked: string;
  hrefMastered: string;
  baseQuery: string;
};

// Underline tabs, not bordered pills: they sit directly on the list below, so they
// read as one column rather than a row of buttons stacked on top of another.
function TabLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`-mb-px border-b-2 pb-2 text-sm transition-colors ${
        active
          ? "border-primary-accent text-foreground"
          : "border-transparent text-fg-muted hover:text-foreground"
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
  hrefMastered,
  baseQuery,
}: Props) {
  const bookmarks = useQolSet(BOOKMARK_KEY);
  const mastered = useQolSet(MASTERED_KEY);

  const shown =
    mode === "bookmarked"
      ? items.filter((item) => bookmarks.has(item.id))
      : mode === "mastered"
      ? items.filter((item) => mastered.has(item.id))
      : items;

  const hrefFor = (target: number) =>
    `/?${baseQuery}${baseQuery ? "&" : ""}questionPage=${String(target)}`;

  const empty =
    mode === "bookmarked" ? (
      bookmarks.count === 0 ? (
        <EmptyState
          title="Belum ada soal tersimpan."
          description="Buka soal di katalog, lalu tekan Simpan."
          actionHref={hrefAll}
          actionLabel="Lihat semua soal"
        />
      ) : (
        <EmptyState
          title="Tidak ada soal tersimpan yang cocok filter."
          description="Sebagian soal tersimpan tidak cocok dengan filter aktif."
          actionHref={hrefBookmarked}
          actionLabel="Lihat semua tersimpan"
        />
      )
    ) : mode === "mastered" ? (
      mastered.count === 0 ? (
        <EmptyState
          title="Belum ada soal yang ditandai dikuasai."
          description="Tandai soal dengan tombol Dikuasai untuk melacak progres."
          actionHref={hrefAll}
          actionLabel="Lihat semua soal"
        />
      ) : (
        <EmptyState
          title="Tidak ada soal dikuasai yang cocok filter."
          description="Sebagian soal dikuasai tidak cocok dengan filter aktif."
          actionHref={hrefMastered}
          actionLabel="Lihat semua dikuasai"
        />
      )
    ) : (
      <EmptyState
        title="Tidak ada soal yang cocok."
        description="Longgarkan kata kunci atau pilih topik lain."
        actionHref={hrefAll}
        actionLabel="Hapus filter"
      />
    );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4" role="tablist" aria-label="Daftar soal">
        <div className="flex items-end gap-5">
          <TabLink href={hrefAll} active={mode === "all"} label="Semua" />
          <TabLink
            href={hrefBookmarked}
            active={mode === "bookmarked"}
            label={`Tersimpan (${bookmarks.count})`}
          />
          <TabLink
            href={hrefMastered}
            active={mode === "mastered"}
            label={`Dikuasai (${mastered.count})`}
          />
        </div>
        {mode !== "all" && shown.length > 0 && (
          <p className="pb-2 text-xs text-fg-soft">
            {shown.length} dari {total}
          </p>
        )}
      </div>

      {shown.length === 0 ? (
        empty
      ) : (
        <ul className="border-b border-border">
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
