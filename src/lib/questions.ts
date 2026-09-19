import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";
import { orderRoles } from "./roles";

export const PER_PAGE = 10;

export type QuestionFilters = {
  role?: string;
  category?: string;
  difficulty?: string;
  q?: string;
};

export type QuestionListItem = {
  id: string;
  role: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string;
  updatedAt: Date;
};

function buildWhere(filters: QuestionFilters): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.category) where.category = filters.category;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.q) {
    where.OR = [
      { question: { contains: filters.q } },
      { answer: { contains: filters.q } },
      { tags: { contains: filters.q } },
    ];
  }
  return where;
}

export async function getQuestions(
  filters: QuestionFilters,
  page: number,
  opts: { limit?: number } = {},
) {
  const perPage = opts.limit ?? PER_PAGE;
  const where = buildWhere(filters);
  const total = await prisma.question.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), totalPages);

  const items = await prisma.question.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (current - 1) * perPage,
    take: perPage,
  });

  return { items, total, totalPages, page: current };
}

export async function getQuestion(id: string) {
  return prisma.question.findUnique({ where: { id } });
}

export type CountByValue = { value: string; count: number };

export async function getRoleCounts(): Promise<CountByValue[]> {
  const rows = await prisma.question.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  const counts = new Map(rows.map((row) => [row.role, row._count._all]));
  return orderRoles([...counts.keys()]).map((value) => ({ value, count: counts.get(value)! }));
}

export async function getCategoryCounts(): Promise<CountByValue[]> {
  const rows = await prisma.question.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  return rows
    .map((row) => ({ value: row.category, count: row._count._all }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export async function getTotalCount(): Promise<number> {
  return prisma.question.count();
}

export async function getStats() {
  const [total, roles, categories] = await Promise.all([
    getTotalCount(),
    getRoleCounts(),
    getCategoryCounts(),
  ]);
  return { total, roles, categories };
}

export async function getFilterOptions() {
  const [roles, categories] = await Promise.all([getRoleCounts(), getCategoryCounts()]);
  return { roles: roles.map((r) => r.value), categories: categories.map((c) => c.value) };
}

// ponytail: sampling acak via shuffle JS, bukan orderBy random Prisma (tidak disupport).
function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getQuizQuestions(
  filters: { role?: string; difficulty?: string; count?: number },
): Promise<QuestionListItem[]> {
  const where: Prisma.QuestionWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.difficulty) where.difficulty = filters.difficulty;

  const rows = await prisma.question.findMany({ where });
  return shuffle(rows).slice(0, filters.count ?? rows.length);
}
