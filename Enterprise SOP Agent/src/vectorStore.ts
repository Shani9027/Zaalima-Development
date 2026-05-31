import { embedText } from "./embeddings";
import type { FileEntry } from "./db";

export interface DocumentChunk {
  id: number;
  fileId: number;
  source: string;
  text: string;
  embedding: number[];
  createdAt: string;
}

const documentChunks: DocumentChunk[] = [];
let chunkCounter = 0;

export async function addDocumentChunks(file: FileEntry, contentText: string) {
  if (!contentText) {
    return [] as DocumentChunk[];
  }

  const chunks = chunkText(contentText, 800);
  const createdChunks: DocumentChunk[] = [];

  for (const chunkTextItem of chunks) {
    const embedding = await embedText(chunkTextItem);
    const chunk: DocumentChunk = {
      id: ++chunkCounter,
      fileId: file.id,
      source: file.fileName,
      text: chunkTextItem,
      embedding,
      createdAt: new Date().toISOString()
    };
    documentChunks.push(chunk);
    createdChunks.push(chunk);
  }

  return createdChunks;
}

export function listDocumentSummaries(limit = 50) {
  return [...documentChunks]
    .reverse()
    .slice(0, limit)
    .map(({ id, fileId, source, text, createdAt }) => ({
      id,
      fileId,
      source,
      snippet: text.slice(0, 240),
      createdAt
    }));
}

export function getDocumentCount() {
  return documentChunks.length;
}

export async function searchSimilarDocuments(query: string, topK = 5) {
  const queryEmbedding = await embedText(query);
  const scores = documentChunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((result) => result.score > 0)
    .map(({ chunk, score }) => ({
      id: chunk.id,
      fileId: chunk.fileId,
      source: chunk.source,
      excerpt: chunk.text,
      score
    }));
}

function chunkText(text: string, maxChunkSize: number) {
  const paragraphs = text.split(/\n{2,}/g).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChunkSize) {
      chunks.push(paragraph);
      continue;
    }

    let remaining = paragraph;
    while (remaining.length > maxChunkSize) {
      const slice = remaining.slice(0, maxChunkSize);
      const boundary = slice.lastIndexOf(".");
      const splitIndex = boundary > maxChunkSize * 0.5 ? boundary + 1 : maxChunkSize;
      chunks.push(remaining.slice(0, splitIndex).trim());
      remaining = remaining.slice(splitIndex).trim();
    }

    if (remaining.length > 0) {
      chunks.push(remaining.trim());
    }
  }

  return chunks;
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dot / (magnitudeA * magnitudeB);
}
