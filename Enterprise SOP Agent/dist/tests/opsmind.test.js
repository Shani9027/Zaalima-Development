"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const app_1 = require("../src/app");
(0, vitest_1.describe)("OpsMind API", () => {
    const app = (0, app_1.createApp)();
    (0, vitest_1.it)("returns a structured OpsMind response", async () => {
        const response = await (0, supertest_1.default)(app).post("/api/opsmind").send({
            userRole: "HR Manager",
            department: "HR",
            accessPermissions: ["Employee Records Read"],
            complianceRequirements: ["PII Handling"],
            userQuestion: "Create an onboarding SOP"
        });
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.assistantName).toBe("OpsMind AI");
        (0, vitest_1.expect)(response.body.mode).toBe("SOP Generator");
        (0, vitest_1.expect)(response.body.sop).toBeDefined();
        (0, vitest_1.expect)(response.body.sop.metadata.department).toBe("HR");
    });
    (0, vitest_1.it)("rejects invalid requests", async () => {
        const response = await (0, supertest_1.default)(app).post("/api/opsmind").send({ department: "Finance" });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body.error).toBe("Invalid request");
        (0, vitest_1.expect)(Array.isArray(response.body.details)).toBe(true);
    });
    (0, vitest_1.it)("returns health status", async () => {
        const response = await (0, supertest_1.default)(app).get("/health");
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.status).toBe("ok");
    });
});
