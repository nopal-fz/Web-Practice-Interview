import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { extraQuestions } from "./data/extra-questions";
import { companyCaseQuestions } from "./data/company-cases";
import { companyCaseQuestions2 } from "./data/company-cases-2";

const allQuestions = [...extraQuestions, ...companyCaseQuestions, ...companyCaseQuestions2];

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.question.findMany({
    select: { question: true },
    distinct: ["question"],
  });
  const existingTexts = new Set(existing.map((q) => q.question));

  const toInsert = allQuestions.filter((q) => !existingTexts.has(q.question));

  if (toInsert.length === 0) {
    console.log(`Tidak ada soal baru: semua ${allQuestions.length} sudah ada.`);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- buang {source} sebelum insert, hanya untuk jejak source di file
    const data = toInsert.map(({ source: _source, ...question }) => question);
    await prisma.question.createMany({ data });
    console.log(`Seed extra selesai: ${toInsert.length} soal baru ditambahkan.`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});