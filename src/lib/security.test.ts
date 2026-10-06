import assert from "node:assert/strict";
import { checkLengths, FIELD_LIMITS, normalizeTags } from "./format";
import { clearAttempts, recordFailure, remainingAttempts } from "./rate-limit";

// No top-level await: tsx emits CJS for this project.

async function main() {
  // Caps reject oversize fields.
  assert.ok(checkLengths({ question: "x".repeat(FIELD_LIMITS.question + 1) }));
  assert.ok(checkLengths({ answer: "x".repeat(FIELD_LIMITS.answer + 1) }));
  assert.ok(checkLengths({ tags: "x".repeat(FIELD_LIMITS.tags + 1) }));

  // Caps clear the longest real rows, so no existing question gets rejected.
  // Measured from dev.db: question 227, answer 2130, tags 81 chars.
  assert.equal(
    checkLengths({ question: "x".repeat(227), answer: "x".repeat(2130), tags: "x".repeat(81) }),
    null,
  );
  assert.equal(checkLengths({}), null);

  // Empty strings are presence errors, not length errors.
  assert.equal(checkLengths({ question: "", answer: "", tags: "" }), null);
  console.log("length caps ok");

  assert.equal(normalizeTags(" Query, sql; QUERY ,, "), "query,sql");

  // Login throttle: 5 attempts per window, then locked until cleared.
  // TRUST_PROXY is unset here, so every caller shares one key per username.
  assert.equal(await remainingAttempts("bob"), 5);
  for (let i = 1; i <= 5; i++) {
    assert.equal(await recordFailure("bob"), i < 5, `attempt ${i} should report remaining`);
  }
  assert.equal(await remainingAttempts("bob"), 0, "must lock after 5 failures");
  assert.equal(await recordFailure("bob"), false, "must stay locked while blocked");

  await clearAttempts("bob");
  assert.equal(await remainingAttempts("bob"), 5, "must reset on success");

  // Different usernames do not share a bucket.
  assert.equal(await remainingAttempts("carol"), 5);
  console.log("rate limit ok");
}

main();