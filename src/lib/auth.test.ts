import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createToken, verifyToken } from "./auth";

// verifyToken is the whole admin auth check: requireAdmin -> isAuthenticated ->
// verifyToken(cookie). Layout guards do not cover Server Action POSTs, so this
// function is the only thing standing between an anonymous caller and the
// create/update/delete/import actions.
//
// Set before the assertions below; verifyToken reads process.env on each call.
process.env.AUTH_SECRET = "unit-test-secret-value-0123456789";

function forge(payload: string, secret: string): string {
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

// No cookie at all.
assert.equal(verifyToken(undefined), false, "missing token must be rejected");
assert.equal(verifyToken(""), false, "empty token must be rejected");

// Garbage shapes.
assert.equal(verifyToken("nodot"), false, "token without separator must be rejected");
assert.equal(verifyToken(".onlysig"), false, "token without payload must be rejected");
assert.equal(verifyToken("onlypayload."), false, "token without signature must be rejected");
assert.equal(verifyToken("a.b.c"), false, "extra segments must be rejected");

// Happy path: a real token verifies.
const good = createToken();
assert.equal(verifyToken(good), true, "freshly minted token must verify");

// Tampered payload: expiry moved far into the future while the old signature
// stays attached.
const [, originalSignature] = good.split(".");
const farFuture = String(Date.now() + 10_000 * 365 * 24 * 60 * 60 * 1000);
assert.equal(verifyToken(`${farFuture}.${originalSignature}`), false, "tampered payload must be rejected");

// Signed with a different secret.
assert.equal(
  verifyToken(forge(farFuture, "attacker-secret")),
  false,
  "foreign signature must be rejected",
);

// Expired token.
assert.equal(verifyToken(forge("1", process.env.AUTH_SECRET!)), false, "expired token must be rejected");

// The regression this file exists for: with AUTH_SECRET unset the HMAC key used
// to fall back to "", so any token signed with an empty key verified. It also
// kept old cookies alive after the secret was removed from .env.
delete process.env.AUTH_SECRET;
assert.equal(
  verifyToken(forge(farFuture, "")),
  false,
  "must fail closed when AUTH_SECRET is unset, not accept empty-key tokens",
);
assert.equal(verifyToken(good), false, "old token must die once AUTH_SECRET is removed");

console.log("auth token ok");