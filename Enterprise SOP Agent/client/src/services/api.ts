import axios from "axios";
import type { OpsMindRequest, OpsMindResponse, OpsMindFile } from "../../../src/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export async function queryOpsMind(request: OpsMindRequest): Promise<OpsMindResponse & { sopId?: number }> {
  const { data } = await api.post("/opsmind", request);
  return data;
}

export async function uploadFile(fileData: {
  fileName: string;
  fileType?: string;
  size: number;
  contentBase64: string;
}): Promise<OpsMindFile> {
  const { data } = await api.post("/files", fileData);
  return data;
}

export async function listFiles(): Promise<OpsMindFile[]> {
  const { data } = await api.get("/files");
  return data;
}

export async function getSOPEntry(id: number) {
  const { data } = await api.get(`/sop/${id}`);
  return data;
}

export async function listSOPs(department?: string, limit = 20) {
  const { data } = await api.get("/sops", {
    params: { department, limit }
  });
  return data;
}

export async function getQueryLogs(limit = 50) {
  const { data } = await api.get("/logs", {
    params: { limit }
  });
  return data;
}

export async function getStats() {
  const { data } = await api.get("/stats");
  return data;
}

export default api;
