// One-off: copy the local dev.db into a remote Turso database.
//
// Why not `prisma migrate deploy`: Prisma does not support it against Turso
// yet (prisma/web Turso EA notes), so the schema goes over as plain SQL and
// the rows go over as an upsert keyed on id. Upsert, not insert, so re-running
// after you edit a question locally overwrites the remote copy instead of
// duplicating it.
//
// Usage (DATABASE_URL and DATABASE_AUTH_TOKEN point at the REMOTE db):
//   LOCAL_DB="file:./dev.db" npx tsx scripts/devdb-to-turso.ts

import "dotenv/config";
import { createClient, type Client } from "@libsql/client";

const BATCH = 50;

type Row = {
  id: string;
  role: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. See .env.example.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const remoteUrl = requireEnv("DATABASE_URL");
  if (!remoteUrl.startsWith("libsql://") && !remoteUrl.startsWith("https://")) {
    console.error(`Refusing to run: DATABASE_URL is "${remoteUrl.slice(0, 12)}...", not a remote libsql:// URL.`);
    console.error("This script writes to the remote DB. Point DATABASE_URL at Turso, and LOCAL_DB at the local file.");
    process.exit(1);
  }

  const local: Client = createClient({ url: process.env.LOCAL_DB ?? "file:./dev.db" });
  const remote: Client = createClient({
    url: remoteUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const found = await local.execute("select count(*) as n from Question");
  const total = Number(found.rows[0]?.n ?? 0);
  console.log(`Source: ${process.env.LOCAL_DB ?? "file:./dev.db"} -> ${total} rows`);
  console.log(`Target: ${remoteUrl}`);

  if (total === 0) {
    console.log("Source is empty. Run `npm run db:seed` first.");
    process.exit(1);
  }

  const read = await local.execute(
    "select id, role, category, difficulty, question, answer, tags, createdAt, updatedAt from Question",
  );
  const rows = read.rows as unknown as Row[];
  const seen = new Set(rows.map((r) => r.id));

  let written = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    for (const r of chunk) {
      // ON CONFLICT keeps this idempotent. createdAt is left alone on update so
      // the original question date survives an edit round-trip.
      await remote.execute({
        sql: `insert into Question (id, role, category, difficulty, question, answer, tags, createdAt, updatedAt)
              values (?, ?, ?, ?, ?, ?, ?, ?, ?)
              on conflict(id) do update set
                role = excluded.role,
                category = excluded.category,
                difficulty = excluded.difficulty,
                question = excluded.question,
                answer = excluded.answer,
                tags = excluded.tags,
                updatedAt = excluded.updatedAt`,
        args: [r.id, r.role, r.category, r.difficulty, r.question, r.answer, r.tags, r.createdAt, r.updatedAt],
      });
      written += 1;
    }
    console.log(`  ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }

  const after = await remote.execute("select count(*) as n from Question");
  console.log(`Done. ${written} rows written, remote now has ${after.rows[0]?.n}.`);

  if (seen.size !== rows.length) {
    console.warn(`Warning: source had duplicate ids (${rows.length - seen.size} extra). Check dev.db.`);
  }

  local.close();
  remote.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});