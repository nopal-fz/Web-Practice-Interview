import {
  BarChart3,
  Compass,
  Container,
  Cpu,
  Database,
  MonitorSmartphone,
  Server,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { titleize } from "./format";

export type RoleConfig = {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
};

export const ROLE_CONFIGS: RoleConfig[] = [
  {
    slug: "data-scientist",
    label: "Data Scientist",
    description: "Statistik, eksperimen A/B, dan analisis yang menjawab pertanyaan bisnis.",
    icon: BarChart3,
    tags: ["statistik", "ab-testing", "python", "explanatory-modeling"],
  },
  {
    slug: "ai-engineer",
    label: "AI Engineer",
    description: "Bangun dan integrasikan aplikasi AI: LLM, RAG, dan agent ke produk sungguhan.",
    icon: Workflow,
    tags: ["llm", "rag", "agents", "integrasi-api"],
  },
  {
    slug: "ml-engineer",
    label: "ML Engineer",
    description: "Training, eval, dan produksi model ML: fitur, skala, dan monitoring.",
    icon: Cpu,
    tags: ["training", "evaluasi", "feature-engineering", "serving"],
  },
  {
    slug: "backend-engineer",
    label: "Backend Engineer",
    description: "Server, API REST/gRPC, arsitektur sistem, dan database berskala.",
    icon: Server,
    tags: ["api", "rest", "grpc", "arsitektur"],
  },
  {
    slug: "mlops-engineer",
    label: "DevOps / MLOps Engineer",
    description: "CI/CD, Kubernetes, infrastruktur, dan deployment model (Triton/vLLM).",
    icon: Container,
    tags: ["ci-cd", "kubernetes", "triton", "vllm", "infrastruktur"],
  },
  {
    slug: "data-engineer",
    label: "Data Engineer",
    description: "SQL, ETL, Spark, data warehouse, dan data pipeline yang andal.",
    icon: Database,
    tags: ["sql", "etl", "spark", "warehouse", "pipeline"],
  },
  {
    slug: "ai-product-manager",
    label: "AI Product Manager",
    description: "Metrik LLM, UX AI, strategi prompt, dan ROI produk AI.",
    icon: Compass,
    tags: ["metrik-llm", "ai-ux", "prompting", "roi"],
  },
  {
    slug: "frontend-fullstack-engineer",
    label: "Frontend / Fullstack Engineer",
    description: "React/Next.js, streaming UI, dan integrasi AI SDK.",
    icon: MonitorSmartphone,
    tags: ["react", "nextjs", "streaming", "ai-sdk"],
  },
];

const bySlug = new Map(ROLE_CONFIGS.map((role) => [role.slug, role]));

export function roleLabel(slug: string): string {
  return bySlug.get(slug)?.label ?? titleize(slug);
}

export function roleDescription(slug: string): string {
  return bySlug.get(slug)?.description ?? "";
}

export function roleIcon(slug: string): LucideIcon | undefined {
  return bySlug.get(slug)?.icon;
}

// Urutkan nilai role yang ada sesuai urutan konfigurasi; role tak dikenal ditaruh di akhir.
export function orderRoles(slugs: string[]): string[] {
  const known = ROLE_CONFIGS.map((role) => role.slug).filter((slug) => slugs.includes(slug));
  const unknown = slugs.filter((slug) => !bySlug.has(slug)).sort();
  return [...known, ...unknown];
}