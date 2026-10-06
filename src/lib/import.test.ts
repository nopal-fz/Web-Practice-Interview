import assert from "node:assert/strict";
import { parseRows } from "./import";

const json = JSON.stringify([
  {
    role: "data-scientist",
    category: "statistics",
    difficulty: "hard",
    question: "Q1",
    answer: "A1",
    tags: "Statistik, Hipotesis",
  },
  { role: "ai-engineer", category: "mlops", question: "Q2", answer: "A2" },
  { role: "", category: "x", question: "Q3", answer: "A3" },
  { role: "ml-engineer", category: "coding", difficulty: "extreme", question: "Q4", answer: "A4" },
]);

const result = parseRows("json", json);
assert.equal(result.rows.length, 3);
assert.equal(result.rows[0].tags, "statistik,hipotesis");
assert.equal(result.rows[1].difficulty, "medium");
assert.equal(result.rows[2].difficulty, "medium");
assert.equal(result.errors.length, 2);

const wrapped = parseRows(
  "json",
  JSON.stringify({ questions: [{ role: "r", category: "c", question: "q", answer: "a" }] }),
);
assert.equal(wrapped.rows.length, 1);
assert.equal(parseRows("json", "{bad").rows.length, 0);
assert.equal(parseRows("json", "{}").rows.length, 0);

const csv = `role,category,difficulty,question,answer,tags\ndata-scientist,sql,easy,"Soal, dengan koma","Jawaban","sql,query"\n`;
const parsedCsv = parseRows("csv", csv);
assert.equal(parsedCsv.rows.length, 1);
assert.equal(parsedCsv.rows[0].question, "Soal, dengan koma");
assert.equal(parsedCsv.rows[0].tags, "sql,query");

// topic / keyConcepts / status. Absent means published + unclassified, which is
// what every row looked like before these columns existed.
const legacy = parseRows(
  "json",
  JSON.stringify([{ role: "r", category: "c", question: "q", answer: "a" }]),
);
assert.equal(legacy.rows[0].status, "published");
assert.equal(legacy.rows[0].topic, "");
assert.equal(legacy.errors.length, 0);

const classified = parseRows(
  "json",
  JSON.stringify([
    {
      role: "ml-engineer",
      category: "deep-learning",
      question: "q",
      answer: "a",
      topic: "deep-learning",
      keyConcepts: ["Gradient Descent", "backpropagation"],
      status: "draft",
    },
  ]),
);
assert.equal(classified.rows[0].topic, "deep-learning");
assert.equal(classified.rows[0].keyConcepts, "gradient descent,backpropagation");
assert.equal(classified.rows[0].status, "draft");
assert.equal(classified.errors.length, 0);

// An unknown topic must NOT be silently accepted: a wrong group is worse than a
// missing one once progress is scored per topic. It is dropped and reported.
const badTopic = parseRows(
  "json",
  JSON.stringify([
    { role: "r", category: "c", question: "q", answer: "a", topic: "prompt-crafting" },
    { role: "r", category: "c", question: "q2", answer: "a", status: "hidden" },
  ]),
);
assert.equal(badTopic.rows[0].topic, "");
assert.ok(
  badTopic.errors.some((e) => e.includes("prompt-crafting")),
  "unknown topic must be reported",
);
assert.equal(badTopic.rows[1].status, "published");
assert.ok(
  badTopic.errors.some((e) => e.includes("hidden")),
  "unknown status must be reported",
);

console.log("import parser ok");
