import { titleize } from "./format";

// Group above the free-text `category`. The bank has 53 distinct category values
// and most of them hold one or two questions, so per-category scoring would be
// noise: a "weak area" computed over `ai-sdk` (1 question) says nothing. Topic is
// the unit progress and weak-area reporting group by.
//
// Slugs are stored on Question.topic. Unknown slugs still render (titleize), so
// a value typed before this list existed degrades instead of disappearing.
const TOPIC_LABELS: Record<string, string> = {
  sql: "SQL & Query",
  statistics: "Statistik",
  "ml-theory": "ML Teori",
  "deep-learning": "Deep Learning",
  llm: "LLM & RAG",
  mlops: "MLOps & Infra",
  "system-design": "System Design",
  behavioral: "Behavioral & Product",
};

// Stable order so the filter list and the admin select do not reshuffle between
// requests, same reasoning as ROLE_ORDER in roles.ts.
const TOPIC_ORDER = Object.keys(TOPIC_LABELS);

// The fixed taxonomy, for the admin select. Exported as a list rather than read
// off the database so a new question can be classified before anything has been
// grouped yet.
export const TOPIC_OPTIONS = TOPIC_ORDER;

export function topicLabel(slug: string): string {
  return TOPIC_LABELS[slug] ?? titleize(slug);
}

export function orderTopics(slugs: string[]): string[] {
  const known = TOPIC_ORDER.filter((slug) => slugs.includes(slug));
  const unknown = slugs.filter((slug) => !(slug in TOPIC_LABELS)).sort();
  return [...known, ...unknown];
}