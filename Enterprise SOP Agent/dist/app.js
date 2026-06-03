"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const opsmind_1 = require("./opsmind");
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
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", service: "opsmind-ai" });
    });
    app.post("/api/opsmind", (req, res, next) => {
        try {
            const validated = parseOpsMindRequest(req.body);
            const response = (0, opsmind_1.generateOpsMindResponse)(validated);
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    });
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
