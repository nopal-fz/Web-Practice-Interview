import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { extraQuestions } from "./data/extra-questions";

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.question.findMany({
    select: { question: true },
    distinct: ["question"],
  });
  const existingTexts = new Set(existing.map((q) => q.question));

  const toInsert = extraQuestions.filter((q) => !existingTexts.has(q.question));

  if (toInsert.length === 0) {
    console.log(`Tidak ada soal baru: semua ${extraQuestions.length} sudah ada.`);
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