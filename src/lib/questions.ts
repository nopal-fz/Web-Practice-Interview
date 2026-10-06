import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./db";
import { orderRoles } from "./roles";
import { orderTopics } from "./topics";

export const PER_PAGE = 10;

export type QuestionFilters = {
  role?: string;
  category?: string;
  difficulty?: string;
  topic?: string;
  q?: string;
  status?: string;
};

export type QuestionListItem = {
  id: string;
  role: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string;
  topic: string;
  keyConcepts: string;
  status: string;
  updatedAt: Date;
};

// Every read below is public-facing unless the caller opts out, because
// "published" is the only state the catalog is allowed to show. Callers that
// legitimately need drafts and archived rows (the admin screens) pass
// includeAll. Defaulting to the safe side matters here: a new call site that
// forgets the flag leaks a draft, whereas forgetting it the other way round
// only hides rows from admins.
function buildWhere(filters: QuestionFilters, includeAll = false): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = {};
  if (!includeAll) where.status = "published";
  else if (filters.status) where.status = filters.status;
  // peran holds comma-separated slugs so more than one role can be picked at once.
  if (filters.role) where.role = { in: filters.role.split(",").filter(Boolean) };
  if (filters.category) where.category = filters.category;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.topic) where.topic = filters.topic;
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
  opts: { limit?: number; includeAll?: boolean } = {},
) {
  const perPage = opts.limit ?? PER_PAGE;
  const where = buildWhere(filters, opts.includeAll);
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

export async function getQuestion(id: string, opts: { includeAll?: boolean } = {}) {
  return prisma.question.findFirst({
    where: { id, ...(opts.includeAll ? {} : { status: "published" }) },
  });
}

export type CountByValue = { value: string; count: number };

export async function getRoleCounts(includeAll = false): Promise<CountByValue[]> {
  const rows = await prisma.question.groupBy({
    by: ["role"],
    where: buildWhere({}, includeAll),
    _count: { _all: true },
  });
  const counts = new Map(rows.map((row) => [row.role, row._count._all]));
  return orderRoles([...counts.keys()]).map((value) => ({ value, count: counts.get(value)! }));
}

export async function getCategoryCounts(includeAll = false): Promise<CountByValue[]> {
  const rows = await prisma.question.groupBy({
    by: ["category"],
    where: buildWhere({}, includeAll),
    _count: { _all: true },
  });
  return rows
    .map((row) => ({ value: row.category, count: row._count._all }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export async function getTopicCounts(includeAll = false): Promise<CountByValue[]> {
  const rows = await prisma.question.groupBy({
    by: ["topic"],
    where: buildWhere({}, includeAll),
    _count: { _all: true },
  });
  // Empty topic means "not classified yet" and is not a bucket of its own.
  const counts = new Map(
    rows.filter((row) => row.topic).map((row) => [row.topic, row._count._all]),
  );
  return orderTopics([...counts.keys()]).map((value) => ({ value, count: counts.get(value)! }));
}

// Counted across every status, so the admin list can say how many archived rows
// are hiding in the table. A filtered page must not be mistaken for a smaller
// catalog.
export async function getStatusCounts(): Promise<Record<string, number>> {
  const rows = await prisma.question.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

export async function getTotalCount(includeAll = false): Promise<number> {
  return prisma.question.count({ where: buildWhere({}, includeAll) });
}

export async function getStats(includeAll = false) {
  const [total, roles, categories, topics] = await Promise.all([
    getTotalCount(includeAll),
    getRoleCounts(includeAll),
    getCategoryCounts(includeAll),
    getTopicCounts(includeAll),
  ]);
  return { total, roles, categories, topics };
}

export async function getFilterOptions(includeAll = false) {
  const [roles, categories, topics] = await Promise.all([
    getRoleCounts(includeAll),
    getCategoryCounts(includeAll),
    getTopicCounts(includeAll),
  ]);
  return {
    roles: roles.map((r) => r.value),
    categories: categories.map((c) => c.value),
    topics: topics.map((t) => t.value),
  };
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

// Sample rows for the landing page, one per difficulty where possible so the
// preview shows the full level range instead of five questions of the same level.
//
// ponytail: one bounded query per difficulty, not findMany() over the whole
// table. The landing page runs on every visit, and loading every row (answers
// included) to pick 3 made page cost scale with catalog size.
export async function getSampleQuestions(count: number): Promise<QuestionListItem[]> {
  const picked: QuestionListItem[] = [];

  for (const difficulty of ["easy", "medium", "hard"]) {
    if (picked.length >= count) break;
    const [row] = await prisma.question.findMany({
      where: { difficulty, status: "published" },
      orderBy: { updatedAt: "desc" },
      take: 1,
    });
    if (row) picked.push(row);
  }

  if (picked.length < count) {
    // Top up with the newest remaining questions so a catalog without all three
    // levels still shows something.
    const rest = await prisma.question.findMany({
      where: {
        status: "published",
        difficulty: { notIn: picked.map((row) => row.difficulty) },
      },
      orderBy: { updatedAt: "desc" },
      take: count - picked.length,
    });
    picked.push(...rest);
  }

  return picked.slice(0, count);
}

export async function getQuizQuestions(
  filters: { role?: string; difficulty?: string; count?: number },
): Promise<QuestionListItem[]> {
  const where: Prisma.QuestionWhereInput = { status: "published" };
  // Same comma-separated convention as buildWhere, so a role shared from the
  // catalog (peran=a,b) also works here instead of matching nothing.
  if (filters.role) where.role = { in: filters.role.split(",").filter(Boolean) };
  if (filters.difficulty) where.difficulty = filters.difficulty;

  const rows = await prisma.question.findMany({ where });
  return shuffle(rows).slice(0, filters.count ?? rows.length);
}
