"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  checkCredentials,
  requireAdmin,
  setSessionCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  normalizeTags,
  normalizeKeyConcepts,
  checkLengths,
  slugify,
  FIELD_LIMITS,
  STATUSES,
} from "@/lib/format";
import { parseRows, MAX_UPLOAD_BYTES, MAX_UPLOAD_CHARS, MAX_UPLOAD_MB, MAX_IMPORT_ROWS } from "@/lib/import";
import { clearAttempts, recordFailure, remainingAttempts } from "@/lib/rate-limit";
import { TOPIC_OPTIONS } from "@/lib/topics";

type ActionState = { error?: string };

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const left = await remainingAttempts(username);
  if (left === 0) {
    return { error: "Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi." };
  }

  // Generic on purpose: naming which field was wrong, or that AUTH_SECRET is
  // unset, tells an attacker how the server is configured.
  if (!checkCredentials(username, password)) {
    const stillLeft = await recordFailure(username);
    return {
      error: stillLeft
        ? "Username atau password salah."
        : "Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.",
    };
  }

  await clearAttempts(username);
  await setSessionCookie();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

// Every mutating action must call requireAdmin() itself. The (protected) layout
// guard only runs when Next renders a page for navigation; Server Actions are
// POSTed straight to their action id and never execute the layout, so a
// layout-only guard leaves create/update/delete/import open to anonymous callers.
export async function saveQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const role = slugify(String(formData.get("role") ?? ""), FIELD_LIMITS.role);
  const category = slugify(String(formData.get("category") ?? ""), FIELD_LIMITS.category);
  const difficulty = String(formData.get("difficulty") ?? "medium").toLowerCase();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const tags = normalizeTags(String(formData.get("tags") ?? ""));
  const topic = slugify(String(formData.get("topic") ?? ""), FIELD_LIMITS.topic);
  const keyConcepts = normalizeKeyConcepts(String(formData.get("keyConcepts") ?? ""));
  const status = String(formData.get("status") ?? "published").toLowerCase();

  if (!role || !category || !question || !answer) {
    return { error: "Role, topik, pertanyaan, dan jawaban wajib diisi." };
  }
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Tingkat kesulitan tidak valid." };
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Status tidak valid." };
  }
  // The form offers topic as a <select>, but a <select> is a client-side
  // convenience, not a constraint: this action is reachable by POST directly. An
  // open-ended topic value would recreate the 53-category fragmentation the field
  // exists to prevent, so the taxonomy is enforced here too. Empty means
  // "not classified yet" and stays allowed.
  if (topic && !TOPIC_OPTIONS.includes(topic)) {
    return { error: "Bidang tidak valid. Pilih salah satu dari daftar." };
  }

  const tooLong = checkLengths({ question, answer, tags, topic, keyConcepts });
  if (tooLong) return { error: tooLong };

  const data = { role, category, difficulty, question, answer, tags, topic, keyConcepts, status };

  if (id) {
    await prisma.question.update({ where: { id }, data });
  } else {
    await prisma.question.create({ data });
  }

  redirect("/admin/questions");
}

// Soft delete. The row stays in the table so a mistaken delete is recoverable and
// so anything that will later reference this question (student answers, scores)
// does not break when an admin tidies the catalog. The catalog only ever reads
// status="published", so an archived question is invisible to the public.
//
// Pass status to move a row somewhere other than archived, which is how the
// admin list restores one.
export async function deleteQuestion(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "archived").toLowerCase();
  if (!id) return;
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return;

  await prisma.question.update({ where: { id }, data: { status } });
  redirect("/admin/questions");
}

export async function importQuestions(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const format = String(formData.get("format") ?? "json");
  const pasted = String(formData.get("data") ?? "").trim();
  const file = formData.get("file");

  let text = pasted;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: `File terlalu besar. Maksimal ${MAX_UPLOAD_MB} MB.` };
    }
    text = await file.text();
  }

  if (!text) {
    return { error: "Tempel data atau pilih file terlebih dahulu." };
  }

  // Cap the payload before parsing. Without it one request can hand the parser a
  // huge blob and createMany a huge set, which is the cheapest DoS available
  // against a site whose admin form is authenticated but otherwise open.
  if (text.length > MAX_UPLOAD_CHARS) {
    return { error: `Data terlalu besar. Maksimal ${MAX_UPLOAD_MB} MB.` };
  }

  const { rows, errors } = parseRows(format, text);
  if (rows.length === 0) {
    return { error: errors[0] ?? "Tidak ada baris valid yang bisa diimpor." };
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      error: `Maksimal ${MAX_IMPORT_ROWS.toLocaleString("id-ID")} soal per import. ` +
        `Data berisi ${rows.length.toLocaleString("id-ID")}. Import per batch.`,
    };
  }

  await prisma.question.createMany({ data: rows });

  const params = new URLSearchParams({ imported: String(rows.length) });
  if (errors.length > 0) {
    params.set("skipped", String(errors.length));
  }
  redirect(`/admin/import?${params.toString()}`);
}
