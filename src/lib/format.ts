export function titleize(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Badge kesulitan memakai warna pastel dari design system (globals.css), bukan
// utility Tailwind, jadi kedua tema tetap punya kontras yang sama.
export const difficultyStyles: Record<string, string> = {
  easy: "badge badge-m",
  medium: "badge badge-s",
  hard: "badge badge-h",
};

export const difficultyLabels: Record<string, string> = {
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
};

// Publication state. draft is hidden from the public catalog but stays editable;
// archived is what an admin "delete" now sets, so the row survives and can be
// restored. Strings rather than a Prisma enum, matching role/category/difficulty,
// so adding a state needs no migration.
export const STATUSES = ["published", "draft", "archived"] as const;
export type Status = (typeof STATUSES)[number];

export const statusLabels: Record<string, string> = {
  published: "Terbit",
  draft: "Draf",
  archived: "Arsip",
};

export function normalizeKeyConcepts(input: string): string {
  // Same rules as normalizeTags: split on commas and semicolons, lowercase,
  // drop blanks, dedupe. Newlines are already whitespace to trim().
  return normalizeTags(input);
}

export function normalizeTags(input: string): string {
  return Array.from(
    new Set(
      input
        .split(/[;,]/)
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).join(",");
}

// Length caps for admin input. Without them every field is an unbounded write
// into SQLite: schema.prisma uses bare String and the forms set no maxLength,
// so one request can store arbitrarily large rows.
//
// Headroom over the longest real row, measured from dev.db: role 27,
// category 19, question 256, answer 5596, tags 81 chars.
export const FIELD_LIMITS = {
  role: 64,
  category: 64,
  question: 2000,
  answer: 100_000,
  tags: 500,
  topic: 64,
  keyConcepts: 500,
} as const;

const FIELD_LABEL: Record<keyof typeof FIELD_LIMITS, string> = {
  role: "peran",
  category: "topik",
  question: "pertanyaan",
  answer: "jawaban",
  tags: "tag",
  topic: "bidang",
  keyConcepts: "konsep kunci",
};

/** Returns an error message when any field is over its cap, else null. */
export function checkLengths(row: Partial<Record<keyof typeof FIELD_LIMITS, string>>): string | null {
  for (const [field, limit] of Object.entries(FIELD_LIMITS) as [
    keyof typeof FIELD_LIMITS,
    number,
  ][]) {
    const value = row[field];
    if (value && value.length > limit) {
      return `${FIELD_LABEL[field]} maksimal ${limit.toLocaleString("id-ID")} karakter.`;
    }
  }
  return null;
}

// Strips to slug-safe characters. Applied to role, category and topic before they
// reach the database, so quotes, angle brackets and control characters cannot
// survive into a value that ends up in a URL or a query.
export function slugify(value: string, maxLength: number): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

export function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}
