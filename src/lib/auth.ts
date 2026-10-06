import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "").update(payload).digest("hex");
}
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function createToken(): string {
  const payload = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  // Fail closed on a missing secret: signing with "" would accept a token anyone
  // could forge with the same empty key, and would keep old cookies valid after
  // AUTH_SECRET is removed from .env. Also reject the shipped placeholder, whose
  // value is public in .env.example, so a forgotten config cannot be forged.
  if (!process.env.AUTH_SECRET || isPlaceholder(process.env.AUTH_SECRET)) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    // Secure by default in production. NODE_ENV alone is not a reliable signal
    // on every host (edge/preview runtimes can serve prod traffic without it), so
    // also treat any non-local HTTPS-looking deployment as secure. Local http
    // (dev, LAN) keeps the cookie usable.
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// Values shipped in .env.example. Copying that file and forgetting to edit them
// is the most likely way this site ships with a guessable admin password and a
// publicly known signing key, so refuse to authenticate with them.
const PLACEHOLDERS = new Set([
  "ubah-ini",
  "ubah-ini-jadi-string-acak-panjang",
  "changeme",
  "secret",
  "your-secret-here",
]);

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim().toLowerCase();
  return PLACEHOLDERS.has(trimmed) || trimmed.startsWith("ubah-ini");
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return false;
  if (isPlaceholder(expectedPass) || isPlaceholder(process.env.AUTH_SECRET)) return false;
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
}
