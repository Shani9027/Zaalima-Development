// Simple in-memory database for OpsMind AI
// For production, you could use SQLite or any other database

interface SOPEntry {
  id: number;
  mode: string;
  department: string;
  userRole: string;
  userQuestion: string;
  summary: string;
  responseData: string;
  createdAt: string;
}

interface QueryLog {
  id: number;
  userQuestion: string;
  mode: string;
  status: "success" | "error";
  errorMessage?: string;
  createdAt: string;
}

export interface FileEntry {
  id: number;
  fileName: string;
  fileType: string;
  size: number;
  contentBase64: string;
  uploadedAt: string;
}

let sopCounter = 0;
let queryCounter = 0;
let fileCounter = 0;
const sopEntries: SOPEntry[] = [];
const queryLogs: QueryLog[] = [];
const fileEntries: FileEntry[] = [];

export function initializeDatabase() {
  // Initialize in-memory database
  console.log("✓ In-memory database initialized");
}

export function saveSOPEntry(entry: Omit<SOPEntry, "id" | "createdAt">): number {
  const id = ++sopCounter;
  sopEntries.push({
    ...entry,
    id,
    createdAt: new Date().toISOString()
  });
  return id;
}

export function getSOPEntry(id: number): SOPEntry | null {
  return sopEntries.find((entry) => entry.id === id) || null;
}

export function listSOPEntries(department?: string, limit = 20): SOPEntry[] {
  let results = [...sopEntries].reverse();
  if (department) {
    results = results.filter((entry) => entry.department === department);
  }
  return results.slice(0, limit);
}

export function saveFileEntry(entry: Omit<FileEntry, "id" | "uploadedAt">): number {
  const id = ++fileCounter;
  fileEntries.push({
    ...entry,
    id,
    uploadedAt: new Date().toISOString()
  });
  return id;
}

export function getFileEntry(id: number): FileEntry | null {
  return fileEntries.find((entry) => entry.id === id) || null;
}

export function listFileEntries(limit = 50): Omit<FileEntry, "contentBase64">[] {
  return [...fileEntries]
    .reverse()
    .slice(0, limit)
    .map(({ contentBase64, ...entry }) => entry);
}

export function logQuery(log: Omit<QueryLog, "id" | "createdAt">): number {
  const id = ++queryCounter;
  queryLogs.push({
    ...log,
    id,
    createdAt: new Date().toISOString()
  });
  return id;
}

export function getQueryLogs(limit = 50): QueryLog[] {
  return [...queryLogs].reverse().slice(0, limit);
}

export function getStats() {
  const totalQueries = queryLogs.length;
  const successfulQueries = queryLogs.filter((q) => q.status === "success").length;
  
  return {
    totalSOPs: sopEntries.length,
    totalQueries,
    successfulQueries
  };
}

