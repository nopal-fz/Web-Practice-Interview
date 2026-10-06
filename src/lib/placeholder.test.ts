import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

// Regression guard: shipping a site whose admin password and HMAC key are still
// the values published in .env.example would be a public, guessable admin panel
// plus forgeable sessions. These must refuse to authenticate.

async function main() {
  process.env.AUTH_SECRET = "ubah-ini-jadi-string-acak-panjang";
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = "ubah-ini";

  const { checkCredentials, createToken, verifyToken } = await import("./auth");

  // Right credentials, but the config is still the shipped placeholder.
  assert.equal(
    checkCredentials("admin", "ubah-ini"),
    false,
    "must refuse placeholder ADMIN_PASSWORD even when the guess is correct",
  );

  // Token minted under a placeholder secret must not verify either.
  const token = createToken();
  assert.equal(
    verifyToken(token),
    false,
    "must reject tokens when AUTH_SECRET is still the placeholder",
  );

  // And a token forged with the literal placeholder value must fail too.
  const far = String(Date.now() + 10_000 * 365 * 24 * 60 * 60 * 1000);
  const forged = `${far}.${createHmac("sha256", "ubah-ini-jadi-string-acak-panjang")
    .update(far)
    .digest("hex")}`;
  assert.equal(verifyToken(forged), false, "must not accept a placeholder-key forgery");

  // Real config works.
  process.env.AUTH_SECRET = "a-real-secret-value-0123456789abcdef";
  process.env.ADMIN_PASSWORD = "a-real-password";
  assert.equal(checkCredentials("admin", "a-real-password"), true, "real creds must pass");
  assert.equal(verifyToken(createToken()), true, "real secret must verify its own token");
  assert.equal(checkCredentials("admin", "wrong"), false, "wrong password must fail");

  console.log("placeholder secret ok");
}

main();