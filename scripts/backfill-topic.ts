// Applies the topic taxonomy and the keyConcepts rubric to questions that already
// exist in a database, i.e. a dev.db or a Turso database that was seeded or
// imported before those columns existed.
//
//   npx tsx scripts/backfill-topic.ts            # dry run, prints a report
//   npx tsx scripts/backfill-topic.ts --write    # apply
//
// The classification itself lives in prisma/topic-classification.ts so the seed
// scripts can share it. A fresh `npm run db:seed` therefore produces classified
// questions and does not need this script afterwards.
//
// Fails loudly on an unmatched question rather than skipping it, because once
// progress is scored per topic a silently unclassified row looks like a real
// signal that the learner is weak at a topic nobody assigned them.

import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { applyTopicClassification } from "../prisma/topic-classification";

const WRITE = process.argv.includes("--write");

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  const before = await prisma.question.groupBy({
    by: ["topic"],
    _count: { _all: true },
  });
  const total = await prisma.question.count();

  console.log(`rows in db        : ${total}`);
  console.log(`already classified: ${before.filter((row) => row.topic).length}`);
  console.log("");
  console.log("topic distribution before:");
  for (const row of before.sort((a, b) => b._count._all - a._count._all)) {
    console.log(`  ${(row.topic || "(unclassified)").padEnd(14)} ${row._count._all}`);
  }

  if (!WRITE) {
    console.log("");
    console.log("dry run, nothing written. Re-run with --write to apply.");
    await prisma.$disconnect();
    return;
  }

  const problems = await applyTopicClassification(prisma);

  const after = await prisma.question.groupBy({
    by: ["topic"],
    _count: { _all: true },
  });

  console.log("");
  console.log("topic distribution after:");
  for (const row of after.sort((a, b) => b._count._all - a._count._all)) {
    console.log(`  ${(row.topic || "(unclassified)").padEnd(14)} ${row._count._all}`);
  }

  const unclassified = await prisma.question.count({ where: { topic: "" } });
  const noRubric = await prisma.question.count({ where: { keyConcepts: "" } });

  console.log("");
  console.log(`rows with no topic        : ${unclassified}`);
  console.log(`rows with no keyConcepts : ${noRubric}`);

  await prisma.$disconnect();

  if (problems.length > 0) {
    console.log("");
    console.log(`${problems.length} row(s) could not be classified:`);
    problems.forEach((line) => console.log(`  ${line}`));
    console.log("");
    console.log("Add an entry to CONCEPTS in prisma/topic-classification.ts and re-run.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});