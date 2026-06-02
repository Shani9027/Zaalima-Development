"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const opsmind_1 = require("./opsmind");
const db_1 = require("./db");
const vectorStore_1 = require("./vectorStore");
(0, db_1.initializeDatabase)();
const opsMindRequestSchema = zod_1.z.object({
    userRole: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    accessPermissions: zod_1.z.array(zod_1.z.string()).optional(),
    organizationHierarchy: zod_1.z.string().optional(),
    previousContext: zod_1.z.string().optional(),
    existingSopVersion: zod_1.z.string().optional(),
    complianceRequirements: zod_1.z.array(zod_1.z.string()).optional(),
    geographicConstraints: zod_1.z.string().optional(),
    mode: zod_1.z.enum([
        "SOP Generator",
        "Workflow Assistant",
        "Compliance Reviewer",
        "Knowledge Search",
        "Incident Response Guide",
        "Employee Onboarding Assistant",
        "Automation Advisor",
        "Audit Preparation Assistant"
    ]).optional(),
    userQuestion: zod_1.z.string().min(1, "userQuestion is required")
});
function parseOpsMindRequest(body) {
    return opsMindRequestSchema.parse(body);
}
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Serve static files from client dist
    app.use(express_1.default.static("dist/client"));
    // Health check
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", service: "opsmind-ai" });
    });
    // Main OpsMind API endpoint
    app.post("/api/opsmind", async (req, res, next) => {
        try {
            const validated = parseOpsMindRequest(req.body);
            const response = await (0, opsmind_1.generateOpsMindResponse)(validated);
            // Log the query
            (0, db_1.logQuery)({
                userQuestion: validated.userQuestion,
                mode: response.mode,
                status: "success"
            });
            // Save SOP entry if applicable
            if (response.sop) {
                const sopId = (0, db_1.saveSOPEntry)({
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
            }
            else {
                res.json(response);
            }
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                (0, db_1.logQuery)({
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
    app.get("/api/sop/:id", (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const sop = (0, db_1.getSOPEntry)(id);
            if (!sop) {
                return res.status(404).json({ error: "SOP not found" });
            }
            res.json(sop);
        }
        catch (error) {
            next(error);
        }
    });
    // List SOP entries
    app.get("/api/sops", (req, res, next) => {
        try {
            const department = req.query.department;
            const limit = Number(req.query.limit || 20);
            const sops = (0, db_1.listSOPEntries)(department, limit);
            res.json(sops);
        }
        catch (error) {
            next(error);
        }
    });
    // Upload a new file
    app.post("/api/files", async (req, res, next) => {
        try {
            const fileSchema = zod_1.z.object({
                fileName: zod_1.z.string().min(1),
                fileType: zod_1.z.string().optional(),
                size: zod_1.z.number().nonnegative(),
                contentBase64: zod_1.z.string().min(1)
            });
            const validated = fileSchema.parse(req.body);
            const id = (0, db_1.saveFileEntry)({
                ...validated,
                fileType: validated.fileType || "application/octet-stream"
            });
            const file = (0, db_1.getFileEntry)(id);
            if (!file) {
                throw new Error("Unable to save file");
            }
            const decoded = Buffer.from(file.contentBase64, "base64").toString("utf-8");
            await (0, vectorStore_1.addDocumentChunks)(file, decoded);
            const response = {
                id: file.id,
                fileName: file.fileName,
                fileType: file.fileType,
                size: file.size,
                uploadedAt: file.uploadedAt
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    });
    // List uploaded files
    app.get("/api/files", (req, res, next) => {
        try {
            const limit = Number(req.query.limit || 50);
            const files = (0, db_1.listFileEntries)(limit);
            res.json(files);
        }
        catch (error) {
            next(error);
        }
    });
    // Get file metadata and content
    app.get("/api/files/:id", (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const file = (0, db_1.getFileEntry)(id);
            if (!file) {
                return res.status(404).json({ error: "File not found" });
            }
            res.json(file);
        }
        catch (error) {
            next(error);
        }
    });
    // Get query logs
    app.get("/api/logs", (req, res, next) => {
        try {
            const limit = Number(req.query.limit || 50);
            const logs = (0, db_1.getQueryLogs)(limit);
            res.json(logs);
        }
        catch (error) {
            next(error);
        }
    });
    // List ingested document chunks
    app.get("/api/documents", (req, res, next) => {
        try {
            const limit = Number(req.query.limit || 50);
            const documents = (0, vectorStore_1.listDocumentSummaries)(limit);
            res.json(documents);
        }
        catch (error) {
            next(error);
        }
    });
    // Get statistics
    app.get("/api/stats", (req, res, next) => {
        try {
            const stats = {
                ...(0, db_1.getStats)(),
                totalDocuments: (0, vectorStore_1.getDocumentCount)()
            };
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    });
    // Serve React SPA fallback
    app.get("*", (req, res) => {
        res.sendFile("dist/client/index.html", { root: process.cwd() });
    });
    // Error handler
    app.use((error, _req, res, _next) => {
        if (error instanceof zod_1.z.ZodError) {
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
