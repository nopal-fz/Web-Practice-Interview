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
// Headroom over the longest real row: role 27, category 19, question 227,
// answer 2130, tags 81 chars.
export const FIELD_LIMITS = {
  role: 64,
  category: 64,
  question: 2000,
  answer: 100_000,
  tags: 500,
} as const;

const FIELD_LABEL: Record<keyof typeof FIELD_LIMITS, string> = {
  role: "peran",
  category: "topik",
  question: "pertanyaan",
  answer: "jawaban",
  tags: "tag",
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

export function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}
