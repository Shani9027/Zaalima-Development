import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { generateOpsMindResponse } from "./opsmind";
import { initializeDatabase, saveSOPEntry, getSOPEntry, listSOPEntries, saveFileEntry, getFileEntry, listFileEntries, logQuery, getQueryLogs, getStats } from "./db";
import { addDocumentChunks, listDocumentSummaries, getDocumentCount } from "./vectorStore";
import type { OpsMindRequest, OpsMindFile } from "./types";

initializeDatabase();

const opsMindRequestSchema = z.object({
  userRole: z.string().optional(),
  department: z.string().optional(),
  accessPermissions: z.array(z.string()).optional(),
  organizationHierarchy: z.string().optional(),
  previousContext: z.string().optional(),
  existingSopVersion: z.string().optional(),
  complianceRequirements: z.array(z.string()).optional(),
  geographicConstraints: z.string().optional(),
  mode: z.enum([
    "SOP Generator",
    "Workflow Assistant",
    "Compliance Reviewer",
    "Knowledge Search",
    "Incident Response Guide",
    "Employee Onboarding Assistant",
    "Automation Advisor",
    "Audit Preparation Assistant"
  ]).optional(),
  userQuestion: z.string().min(1, "userQuestion is required")
});

function parseOpsMindRequest(body: unknown): OpsMindRequest {
  return opsMindRequestSchema.parse(body);
}

export function createApp() {
  const app = express();

  app.use(express.json());

  // Serve static files from client dist
  app.use(express.static("dist/client"));

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "opsmind-ai" });
  });

  // Main OpsMind API endpoint
  app.post("/api/opsmind", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = parseOpsMindRequest(req.body);
      const response = await generateOpsMindResponse(validated);

      // Log the query
      logQuery({
        userQuestion: validated.userQuestion,
        mode: response.mode,
        status: "success"
      });

      // Save SOP entry if applicable
      if (response.sop) {
        const sopId = saveSOPEntry({
          mode: response.mode,
          department: validated.department || "Unknown",
          userRole: validated.userRole || "Unknown",
          userQuestion: validated.userQuestion,
          summary: response.summary,
          responseData: JSON.stringify(response, null, 2)
        });
        res.json({
          ...response,
          sopId
        });
      } else {
        res.json(response);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        logQuery({
          userQuestion: req.body?.userQuestion || "Unknown",
          mode: req.body?.mode || "Unknown",
          status: "error",
          errorMessage: "Validation failed"
        });
      }
      next(error);
    }
  });

  // Get SOP entry by ID
  app.get("/api/sop/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const sop = getSOPEntry(id);
      if (!sop) {
        return res.status(404).json({ error: "SOP not found" });
      }
      res.json(sop);
    } catch (error) {
      next(error);
    }
  });

  // List SOP entries
  app.get("/api/sops", (req: Request, res: Response, next: NextFunction) => {
    try {
      const department = req.query.department as string | undefined;
      const limit = Number(req.query.limit || 20);
      const sops = listSOPEntries(department, limit);
      res.json(sops);
    } catch (error) {
      next(error);
    }
  });

  // Upload a new file
  app.post("/api/files", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileSchema = z.object({
        fileName: z.string().min(1),
        fileType: z.string().optional(),
        size: z.number().nonnegative(),
        contentBase64: z.string().min(1)
      });

      const validated = fileSchema.parse(req.body);
      const id = saveFileEntry({
        ...validated,
        fileType: validated.fileType || "application/octet-stream"
      });
      const file = getFileEntry(id);

      if (!file) {
        throw new Error("Unable to save file");
      }

      const decoded = Buffer.from(file.contentBase64, "base64").toString("utf-8");
      await addDocumentChunks(file, decoded);

      const response: OpsMindFile = {
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        size: file.size,
        uploadedAt: file.uploadedAt
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  });

  // List uploaded files
  app.get("/api/files", (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit || 50);
      const files = listFileEntries(limit);
      res.json(files);
    } catch (error) {
      next(error);
    }
  });

  // Get file metadata and content
  app.get("/api/files/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const file = getFileEntry(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(file);
    } catch (error) {
      next(error);
    }
  });

  // Get query logs
  app.get("/api/logs", (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit || 50);
      const logs = getQueryLogs(limit);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });

  // List ingested document chunks
  app.get("/api/documents", (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit || 50);
      const documents = listDocumentSummaries(limit);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });

  // Get statistics
  app.get("/api/stats", (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = {
        ...getStats(),
        totalDocuments: getDocumentCount()
      };
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Serve React SPA fallback
  app.get("*", (req: Request, res: Response) => {
    res.sendFile("dist/client/index.html", { root: process.cwd() });
  });

  // Error handler
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
