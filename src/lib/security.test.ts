import assert from "node:assert/strict";
import {
  checkLengths,
  normalizeKeyConcepts,
  normalizeTags,
  slugify,
  FIELD_LIMITS,
  STATUSES,
} from "./format";
import { clearAttempts, recordFailure, remainingAttempts } from "./rate-limit";

// No top-level await: tsx emits CJS for this project.

async function main() {
  // Caps reject oversize fields.
  assert.ok(checkLengths({ question: "x".repeat(FIELD_LIMITS.question + 1) }));
  assert.ok(checkLengths({ answer: "x".repeat(FIELD_LIMITS.answer + 1) }));
  assert.ok(checkLengths({ tags: "x".repeat(FIELD_LIMITS.tags + 1) }));
  assert.ok(checkLengths({ topic: "x".repeat(FIELD_LIMITS.topic + 1) }));
  assert.ok(checkLengths({ keyConcepts: "x".repeat(FIELD_LIMITS.keyConcepts + 1) }));

  // Caps clear the longest real rows, so no existing question gets rejected.
  // Measured from dev.db: question 256, answer 5596, tags 81 chars.
  assert.equal(
    checkLengths({ question: "x".repeat(256), answer: "x".repeat(5596), tags: "x".repeat(81) }),
    null,
  );
  assert.equal(checkLengths({}), null);

  // Empty strings are presence errors, not length errors.
  assert.equal(checkLengths({ question: "", answer: "", tags: "" }), null);
  console.log("length caps ok");

  assert.equal(normalizeTags(" Query, sql; QUERY ,, "), "query,sql");
  assert.equal(normalizeKeyConcepts("p-value, Hipotesis ; p-value"), "p-value,hipotesis");
  assert.equal(normalizeKeyConcepts(""), "");

  // slugify is what stands between admin input and a value that ends up in a URL
  // and a query. It has to strip characters that would break either.
  assert.equal(slugify("Data Scientist", FIELD_LIMITS.role), "data-scientist");
  assert.equal(slugify("  <script>alert(1)</script>  ", FIELD_LIMITS.role), "script-alert-1-script");
  assert.equal(slugify("a/../b", FIELD_LIMITS.role), "a-..-b");
  assert.equal(slugify("!!!", FIELD_LIMITS.role), "");
  assert.equal(slugify("x".repeat(200), FIELD_LIMITS.topic).length, FIELD_LIMITS.topic);
  // A topic is optional; empty input must stay empty, not become "-".
  assert.equal(slugify("", FIELD_LIMITS.topic), "");
  assert.equal(slugify("llm", FIELD_LIMITS.topic), "llm");

  // status is a closed set because soft delete writes it.
  assert.ok(STATUSES.includes("archived"));
  assert.ok(STATUSES.includes("draft"));
  assert.ok(STATUSES.includes("published"));
  console.log("slugify ok");

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