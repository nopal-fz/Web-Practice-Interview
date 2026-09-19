import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const questions = await prisma.question.findMany({
    select: { id: true, updatedAt: true },
  });

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/questions`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...questions.map((q) => ({
      url: `${SITE_URL}/questions/${q.id}`,
      lastModified: q.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}