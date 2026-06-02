"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOpenAI = void 0;
exports.embedText = embedText;
const openai_1 = __importDefault(require("openai"));
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new openai_1.default({ apiKey }) : null;
exports.hasOpenAI = Boolean(openai);
async function embedText(text) {
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
function fallbackEmbedding(text) {
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
function normalize(values) {
    const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
    if (magnitude === 0) {
        return values.map(() => 0);
    }
    return values.map((value) => value / magnitude);
}
