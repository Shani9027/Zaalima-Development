import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("OpsMind API", () => {
  const app = createApp();

  it("returns a structured OpsMind response", async () => {
    const response = await request(app).post("/api/opsmind").send({
      userRole: "HR Manager",
      department: "HR",
      accessPermissions: ["Employee Records Read"],
      complianceRequirements: ["PII Handling"],
      userQuestion: "Create an onboarding SOP"
    });

    expect(response.status).toBe(200);
    expect(response.body.assistantName).toBe("OpsMind AI");
    expect(response.body.mode).toBe("SOP Generator");
    expect(response.body.sop).toBeDefined();
    expect(response.body.sop.metadata.department).toBe("HR");
  });

  it("rejects invalid requests", async () => {
    const response = await request(app).post("/api/opsmind").send({ department: "Finance" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request");
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
