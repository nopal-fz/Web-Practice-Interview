import Papa from "papaparse";
import { normalizeTags, normalizeKeyConcepts, checkLengths, STATUSES } from "./format";
import { TOPIC_OPTIONS } from "./topics";

export type ImportRow = {
  role: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string;
  topic: string;
  keyConcepts: string;
  status: string;
};

export type ParseResult = { rows: ImportRow[]; errors: string[] };

const DIFFICULTIES = ["easy", "medium", "hard"];

// Import caps. The admin form is authenticated, but an authenticated admin (or
// a session that got stolen) should not be able to OOM the server with one
// request. 5 MB comfortably fits the existing seed files; 1000 rows is several
// screens of editing, not a real session.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
// ~4 bytes/char for UTF-8 is generous for a safety check; bytes already covers
// files, this covers pasted text that never touches the filesystem.
export const MAX_UPLOAD_CHARS = MAX_UPLOAD_BYTES;
export const MAX_IMPORT_ROWS = 1000;

function toRow(raw: Record<string, unknown>, index: number, errors: string[]): ImportRow | null {
  const get = (key: string): string => {
    const value = raw[key];
    if (typeof value === "string") return value.trim();
    if (value == null) return "";
    return String(value).trim();
  };

  const role = get("role");
  const category = get("category");
  const question = get("question");
  const answer = get("answer");
  const rawDifficulty = (get("difficulty") || "medium").toLowerCase();

  if (!role || !category || !question || !answer) {
    errors.push(`Baris ${index + 1}: role, category, question, dan answer wajib diisi.`);
    return null;
  }

  let difficulty = rawDifficulty;
  if (!DIFFICULTIES.includes(difficulty)) {
    errors.push(`Baris ${index + 1}: difficulty "${rawDifficulty}" tidak dikenal, dipakai "medium".`);
    difficulty = "medium";
  }

  const rawTags = raw["tags"];
  const tags = normalizeTags(Array.isArray(rawTags) ? rawTags.join(",") : get("tags"));

  // Optional since the columns predate them. Absent topic stays "" (unclassified)
  // rather than being guessed, because a wrong group is worse than a missing one
  // once progress starts being scored per topic. Absent status means published,
  // which is what every imported row used to be.
  const rawTopic = get("topic");
  let topic = rawTopic;
  if (rawTopic && !TOPIC_OPTIONS.includes(rawTopic)) {
    errors.push(
      `Baris ${index + 1}: topic "${rawTopic}" tidak dikenal, dikosongkan. ` +
        `Pilihan: ${TOPIC_OPTIONS.join(", ")}.`,
    );
    topic = "";
  }

  const rawKeyConcepts = raw["keyConcepts"] ?? raw["key_concepts"];
  const keyConcepts = normalizeKeyConcepts(
    Array.isArray(rawKeyConcepts) ? rawKeyConcepts.join(",") : get("keyConcepts"),
  );

  const rawStatus = (get("status") || "published").toLowerCase();
  let status = rawStatus;
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    errors.push(`Baris ${index + 1}: status "${rawStatus}" tidak dikenal, dipakai "published".`);
    status = "published";
  }

  const tooLong = checkLengths({ question, answer, tags, topic, keyConcepts });
  if (tooLong) {
    errors.push(`Baris ${index + 1}: ${tooLong}`);
    return null;
  }

  return { role, category, difficulty, question, answer, tags, topic, keyConcepts, status };
}

export function parseRows(format: string, text: string): ParseResult {
  const errors: string[] = [];

  if (format === "csv") {
    // No escapeFormulae here: that option belongs to Papa.unparse (writing CSV),
// not parse. Reading is where the risk would land, so the neutralisation has to
// happen on write -- there is no CSV export in this app yet. When one is added,
// pass escapeFormulae: true to unparse.
// TODO(export): add escapeFormulae: true to the unparse call when CSV export lands.
const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    for (const error of parsed.errors) {
      errors.push(`CSV: ${error.message}${error.row != null ? ` (baris ${error.row + 1})` : ""}`);
    }
    const rows = parsed.data
      .map((record, index) => toRow(record, index, errors))
      .filter((row): row is ImportRow => row !== null);
    return { rows, errors };
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { rows: [], errors: ["JSON tidak valid."] };
  }

  let list: unknown[] | null = null;
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object" && "questions" in data) {
    const candidate = (data as { questions?: unknown }).questions;
    if (Array.isArray(candidate)) list = candidate;
  }

  if (!list) {
    return {
      rows: [],
      errors: ['JSON harus berupa array soal, atau objek dengan field "questions" berisi array.'],
    };
  }

  const rows = list
    .map((item, index) => toRow((item ?? {}) as Record<string, unknown>, index, errors))
    .filter((row): row is ImportRow => row !== null);

  return { rows, errors };
}
