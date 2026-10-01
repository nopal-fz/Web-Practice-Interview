import { titleize } from "./format";

const ROLE_LABELS: Record<string, string> = {
  "data-scientist": "Data Scientist",
  "ai-engineer": "AI Engineer",
  "ml-engineer": "ML Engineer",
  "backend-engineer": "Backend Engineer",
  "mlops-engineer": "DevOps / MLOps Engineer",
  "data-engineer": "Data Engineer",
  "ai-product-manager": "AI Product Manager",
  "frontend-fullstack-engineer": "Frontend / Fullstack Engineer",
};

// Urutan stabil supaya filter role dan tab admin tidak berubah urutan antar-request.
const ROLE_ORDER = Object.keys(ROLE_LABELS);

export function roleLabel(slug: string): string {
  return ROLE_LABELS[slug] ?? titleize(slug);
}

// Urutkan nilai role yang ada sesuai urutan konfigurasi; role tak dikenal ditaruh di akhir.
export function orderRoles(slugs: string[]): string[] {
  const known = ROLE_ORDER.filter((slug) => slugs.includes(slug));
  const unknown = slugs.filter((slug) => !(slug in ROLE_LABELS)).sort();
  return [...known, ...unknown];
}