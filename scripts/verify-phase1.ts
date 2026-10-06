// Verification harness for Phase 1. Not part of `npm test`.
//
//   npx tsx scripts/verify-phase1.ts
//
// Scope note, because it matters for reading the results: the server actions in
// src/app/admin/actions.ts cannot be called from here. requireAdmin() reads
// cookies() from next/headers, which only resolves inside a Next request. That is
// a harness limitation, not a defect, and it is NOT worked around by loosening the
// guard. What this file covers instead:
//
//   A. the normalisation and validation the actions perform, using the same
//      exported helpers the actions call
//   B. the query layer contract: which rows each reader may see
//   C. the write semantics, using the exact payload shape the actions build
//
// The action bodies themselves are 20 lines of straight-line code over (A) and (C).
// Page rendering is verified separately against a running dev server.
//
// Deletes everything it creates.

import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  checkLengths,
  normalizeKeyConcepts,
  normalizeTags,
  slugify,
  FIELD_LIMITS,
  STATUSES,
} from "../src/lib/format";
import { TOPIC_OPTIONS as TAXONOMY } from "../src/lib/topics";

async function main() {
  const {
    getQuestions,
    getQuestion,
    getTotalCount,
    getStats,
    getFilterOptions,
    getQuizQuestions,
    getSampleQuestions,
    getStatusCounts,
  } = await import("../src/lib/questions");

  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  let failures = 0;
  function check(label: string, actual: unknown, expected: unknown) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) failures += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
    if (!ok) {
      console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }
  function note(label: string, value: unknown) {
    console.log(`      ${label}: ${JSON.stringify(value)}`);
  }

  // Reproduces the payload saveQuestion() builds, so the writes below are the
  // same shape the action produces rather than a convenient approximation.
  function buildPayload(raw: Record<string, string>) {
    const difficulty = (raw.difficulty ?? "medium").toLowerCase();
    const status = (raw.status ?? "published").toLowerCase();
    const payload = {
      role: slugify(raw.role ?? "", FIELD_LIMITS.role),
      category: slugify(raw.category ?? "", FIELD_LIMITS.category),
      topic: slugify(raw.topic ?? "", FIELD_LIMITS.topic),
      difficulty,
      question: (raw.question ?? "").trim(),
      answer: (raw.answer ?? "").trim(),
      tags: normalizeTags(raw.tags ?? ""),
      keyConcepts: normalizeKeyConcepts(raw.keyConcepts ?? ""),
      status,
    };
    const missing = !payload.role || !payload.category || !payload.question || !payload.answer;
    const badDifficulty = !["easy", "medium", "hard"].includes(difficulty);
    const badStatus = !STATUSES.includes(status as (typeof STATUSES)[number]);
    const tooLong = checkLengths(payload);
    const badTopic = Boolean(payload.topic) && !TAXONOMY.includes(payload.topic);
    return {
      payload,
      error: missing
        ? "required"
        : badDifficulty
        ? "difficulty"
        : badStatus
        ? "status"
        : badTopic
        ? "topic"
        : (tooLong ?? null),
    };
  }

  const BASE = {
    role: "data-scientist",
    category: "Verify Phase1",
    question: "VERIFY Pertanyaan sementara Phase 1",
    answer: "Jawaban sementara.",
    difficulty: "medium",
    tags: "verify, Verify",
  };

  console.log("=== A. validation + normalisation (real helpers) ===");
  check("slugify strips markup", slugify("<script>x</script>", FIELD_LIMITS.topic), "script-x-script");
  check("slugify of empty topic stays empty", slugify("", FIELD_LIMITS.topic), "");
  check("keyConcepts lowercased and deduped", normalizeKeyConcepts("A, b ; A"), "a,b");
  const { payload: created } = buildPayload({ ...BASE, keyConcepts: "P-value, hipotesis , p-value" });
  check("role slugified", created.role, "data-scientist");
  check("category slugified", created.category, "verify-phase1");
  check("tags normalised", created.tags, "verify");
  check("keyConcepts normalised", created.keyConcepts, "p-value,hipotesis");
  check("status defaults to published", created.status, "published");
  check("topic defaults to empty", created.topic, "");
  check("required fields present -> no error", buildPayload(BASE).error, null);
  check("blank answer -> required error", buildPayload({ ...BASE, answer: "" }).error, "required");
  check("bad difficulty -> difficulty error", buildPayload({ ...BASE, difficulty: "extreme" }).error, "difficulty");
  check("bad status -> status error", buildPayload({ ...BASE, status: "hidden" }).error, "status");
  check("topic outside the taxonomy is refused", buildPayload({ ...BASE, topic: "Statistik" }).error, "topic");
  check("topic in the taxonomy is accepted", buildPayload({ ...BASE, topic: "statistics" }).error, null);
  check("empty topic is allowed (unclassified)", buildPayload({ ...BASE, topic: "" }).error, null);
  // slugify truncates at the cap, so an over-long topic cannot exceed it rather
  // than being rejected. keyConcepts is not a slug, so it is rejected instead.
  check(
    "over-long topic is truncated to the cap",
    buildPayload({ ...BASE, topic: "x".repeat(200) }).payload.topic.length,
    FIELD_LIMITS.topic,
  );
  check(
    "over-cap keyConcepts is rejected",
    buildPayload({ ...BASE, keyConcepts: "x".repeat(600) }).error,
    "konsep kunci maksimal 500 karakter.",
  );

  console.log("");
  console.log("=== baseline (public readers) ===");
  const totalBefore = await getTotalCount();
  const statsBefore = await getStats();
  note("public total", totalBefore);
  note("public roles / categories", [statsBefore.roles.length, statsBefore.categories.length]);
  note("public topics", statsBefore.topics.map((t) => `${t.value}=${t.count}`).join(" "));

  console.log("");
  console.log("=== 6. create (no new fields supplied, so DB defaults apply) ===");
  const { payload: plain, error } = buildPayload(BASE);
  if (error) throw new Error(`unexpected payload error: ${error}`);
  const row = await prisma.question.create({ data: plain });
  check("topic defaults to empty on a new row", row.topic, "");
  check("keyConcepts defaults to empty on a new row", row.keyConcepts, "");
  check("status defaults to published on a new row", row.status, "published");
  check("new row is publicly visible", await getTotalCount(), totalBefore + 1);
  check("public getQuestion() reads it", (await getQuestion(row.id))?.question, BASE.question);

  console.log("");
  console.log("=== 7. edit ===");
  const { payload: editedPayload } = buildPayload({
    ...BASE,
    keyConcepts: "P-value, hipotesis , p-value",
    topic: "statistics",
    status: "published",
  });
  const edited = await prisma.question.update({ where: { id: row.id }, data: editedPayload });
  check("topic saved", edited.topic, "statistics");
  check("keyConcepts saved normalised", edited.keyConcepts, "p-value,hipotesis");
  check("question text unchanged by the edit", edited.question, BASE.question);
  check("answer unchanged by the edit", edited.answer, BASE.answer);
  check("no duplicate row created by the edit",
    await prisma.question.count({ where: { question: BASE.question } }), 1);

  console.log("");
  console.log("=== 8. draft hides from every public reader ===");
  await prisma.question.update({ where: { id: row.id }, data: { status: "draft" } });
  check("public total unchanged", await getTotalCount(), totalBefore);
  check("public getQuestion() cannot see it", (await getQuestion(row.id)) === null, true);
  check("admin getQuestion() can see it", (await getQuestion(row.id, { includeAll: true }))?.status, "draft");
  check("quiz excludes it", (await getQuizQuestions({ count: 500 })).some((q) => q.id === row.id), false);
  check("landing sample excludes it", (await getSampleQuestions(1)).some((q) => q.id === row.id), false);
  check("public keyword search excludes it",
    (await getQuestions({ q: "VERIFY Pertanyaan sementara" }, 1)).total, 0);
  check("admin keyword search includes it",
    (await getQuestions({ q: "VERIFY Pertanyaan sementara" }, 1, { includeAll: true })).total, 1);
  check("admin can filter to draft only",
    (await getQuestions({ category: "verify-phase1", status: "draft" }, 1, { includeAll: true })).total, 1);

  console.log("");
  console.log("=== 9. soft delete ===");
  // deleteQuestion() now writes status, not a hard delete.
  await prisma.question.update({ where: { id: row.id }, data: { status: "archived" } });
  const after = await prisma.question.findUnique({ where: { id: row.id } });
  check("row still present in the table", after !== null, true);
  check("status is archived", after?.status, "archived");
  check("question content preserved", after?.question, BASE.question);
  check("answer content preserved", after?.answer, BASE.answer);
  check("topic preserved", after?.topic, "statistics");
  check("public total unchanged after delete", await getTotalCount(), totalBefore);
  check("public getQuestion() 404s it", (await getQuestion(row.id)) === null, true);
  check("archived absent from public list", (await getQuestions({ category: "verify-phase1" }, 1)).total, 0);
  check("archived present in admin list",
    (await getQuestions({ category: "verify-phase1" }, 1, { includeAll: true })).total, 1);
  check("admin can filter to archived only",
    (await getQuestions({ category: "verify-phase1", status: "archived" }, 1, { includeAll: true })).total, 1);
  note("status counts", await getStatusCounts());

  console.log("");
  console.log("=== 10. restore ===");
  await prisma.question.update({ where: { id: row.id }, data: { status: "published" } });
  check("public reader sees it again", (await getQuestion(row.id))?.status, "published");
  check("public total back up by one", await getTotalCount(), totalBefore + 1);

  console.log("");
  console.log("=== 11. existing data intact ===");
  const byTopic = await prisma.question.groupBy({ by: ["topic"], _count: { _all: true } });
  check("no question left without a topic", byTopic.filter((r) => !r.topic).length, 0);
  check("no row lacks a rubric", await prisma.question.count({ where: { keyConcepts: "" } }), 0);
  check("no blank required field",
    await prisma.question.count({
      where: { OR: [{ question: "" }, { answer: "" }, { role: "" }, { category: "" }] },
    }), 0);
  const opts = await getFilterOptions();
  const adminOpts = await getFilterOptions(true);
  note("public options", { roles: opts.roles.length, categories: opts.categories.length, topics: opts.topics });
  note("admin options", { roles: adminOpts.roles.length, categories: adminOpts.categories.length });
  check("every topic slug is in the fixed taxonomy",
    opts.topics.every((t) => ["sql", "statistics", "ml-theory", "deep-learning", "llm", "mlops", "system-design", "behavioral"].includes(t)),
    true);

  console.log("");
  console.log("=== cleanup ===");
  await prisma.question.delete({ where: { id: row.id } });
  check("row count back to original baseline", await prisma.question.count(), totalBefore);
  check("no verify-phase1 rows left",
    await prisma.question.count({ where: { category: "verify-phase1" } }), 0);

  await prisma.$disconnect();
  console.log("");
  console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});