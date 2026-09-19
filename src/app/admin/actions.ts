"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie, checkCredentials, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeTags } from "@/lib/format";
import { parseRows } from "@/lib/import";

type ActionState = { error?: string };

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!process.env.AUTH_SECRET) {
    return { error: "AUTH_SECRET belum diatur di file .env." };
  }
  if (!checkCredentials(username, password)) {
    return { error: "Username atau password salah." };
  }

  await setSessionCookie();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function saveQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const role = slugify(String(formData.get("role") ?? ""));
  const category = slugify(String(formData.get("category") ?? ""));
  const difficulty = String(formData.get("difficulty") ?? "medium").toLowerCase();
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const tags = normalizeTags(String(formData.get("tags") ?? ""));

  if (!role || !category || !question || !answer) {
    return { error: "Role, topik, pertanyaan, dan jawaban wajib diisi." };
  }
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Tingkat kesulitan tidak valid." };
  }

  const data = { role, category, difficulty, question, answer, tags };

  if (id) {
    await prisma.question.update({ where: { id }, data });
  } else {
    await prisma.question.create({ data });
  }

  redirect("/admin/questions");
}

export async function deleteQuestion(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.question.delete({ where: { id } });
  }
  redirect("/admin/questions");
}

export async function importQuestions(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const format = String(formData.get("format") ?? "json");
  const pasted = String(formData.get("data") ?? "").trim();
  const file = formData.get("file");

  let text = pasted;
  if (file instanceof File && file.size > 0) {
    text = await file.text();
  }

  if (!text) {
    return { error: "Tempel data atau pilih file terlebih dahulu." };
  }

  const { rows, errors } = parseRows(format, text);
  if (rows.length === 0) {
    return { error: errors[0] ?? "Tidak ada baris valid yang bisa diimpor." };
  }

  await prisma.question.createMany({ data: rows });

  const params = new URLSearchParams({ imported: String(rows.length) });
  if (errors.length > 0) {
    params.set("skipped", String(errors.length));
  }
  redirect(`/admin/import?${params.toString()}`);
}
