export function titleize(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Badge kesulitan memakai status semantik (mudah/sedang/sulit) yang aman di mode terang dan gelap.
// Warna didefinisikan sebagai token CSS di globals.css, bukan utility Tailwind.
export const difficultyStyles: Record<string, string> = {
  easy: "badge badge-easy",
  medium: "badge badge-medium",
  hard: "badge badge-hard",
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

export function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}
