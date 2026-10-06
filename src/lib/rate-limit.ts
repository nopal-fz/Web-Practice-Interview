import { headers } from "next/headers";

// In-memory throttle for the login action. No dependency: a Map keyed by client
// address plus username is enough for a single-admin app.
//
// ponytail: state lives per process, so on multi-instance hosts (Vercel
// functions, PM2 cluster) the limit resets per instance and N instances give N
// times the budget. Acceptable while the site is single-instance or self-hosted;
// move to a shared store (Upstash, Redis) before scaling out.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Bucket = { count: number; firstAt: number };
const attempts = new Map<string, Bucket>();

// Opportunistic sweep. Without it the Map grows one entry per distinct key
// forever, which is a slow leak on a public login page.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, bucket] of attempts) {
    if (now - bucket.firstAt > WINDOW_MS) attempts.delete(key);
  }
}

async function key(username: string): Promise<string> {
  // x-forwarded-for is client-controlled unless a proxy overwrites it, so only
  // trust it when TRUST_PROXY says a proxy is in front. Otherwise every caller
  // shares one bucket, which is the safe direction to fail in.
  let address = "local";
  if (process.env.TRUST_PROXY === "true") {
    const fwd = (await headers()).get("x-forwarded-for");
    if (fwd) address = fwd.split(",")[0].trim();
  }
  return `${address}:${username}`;
}

/** Returns remaining attempts, or 0 once the window is exhausted. */
export async function remainingAttempts(username: string): Promise<number> {
  const now = Date.now();
  sweep(now);

  const bucket = attempts.get(await key(username));
  if (!bucket || now - bucket.firstAt > WINDOW_MS) return MAX_ATTEMPTS;

  return Math.max(0, MAX_ATTEMPTS - bucket.count);
}

/** Call after a failed login only. Returns false once the window is exhausted. */
export async function recordFailure(username: string): Promise<boolean> {
  const now = Date.now();
  sweep(now);

  const id = await key(username);
  const bucket = attempts.get(id);
  if (!bucket || now - bucket.firstAt > WINDOW_MS) {
    attempts.set(id, { count: 1, firstAt: now });
  } else {
    bucket.count += 1;
  }

  return MAX_ATTEMPTS - attempts.get(id)!.count > 0;
}

export async function clearAttempts(username: string): Promise<void> {
  attempts.delete(await key(username));
}