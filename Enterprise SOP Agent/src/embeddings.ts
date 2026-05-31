import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export const hasOpenAI = Boolean(openai);

export async function embedText(text: string): Promise<number[]> {
  if (!text) {
    return Array(1536).fill(0);
  }

  if (!openai) {
    return fallbackEmbedding(text);
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
}

function fallbackEmbedding(text: string): number[] {
  const clean = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const signalWords = [
    "process",
    "procedure",
    "compliance",
    "risk",
    "audit",
    "incident",
    "security",
    "workflow",
    "automation",
    "policy"
  ];

  const counts = signalWords.map((word) => clean.filter((token) => token === word).length);
  return normalize([...counts, ...Array(1536 - counts.length).fill(0)]);
}

function normalize(values: number[]): number[] {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) {
    return values.map(() => 0);
  }
  return values.map((value) => value / magnitude);
}
