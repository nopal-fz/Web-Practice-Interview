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

console.log("import parser ok");
