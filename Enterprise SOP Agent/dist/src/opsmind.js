"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpsMindResponse = generateOpsMindResponse;
const vectorStore_1 = require("./vectorStore");
const embeddings_1 = require("./embeddings");
const openai_1 = __importDefault(require("openai"));
const DEFAULT_MODE = "Workflow Assistant";
const openai = process.env.OPENAI_API_KEY ? new openai_1.default({ apiKey: process.env.OPENAI_API_KEY }) : null;
function pickMode(request) {
    if (request.mode) {
        return request.mode;
    }
    const question = request.userQuestion.toLowerCase();
    if (question.includes("sop") || question.includes("procedure"))
        return "SOP Generator";
    if (question.includes("compliance") || question.includes("audit"))
        return "Compliance Reviewer";
    if (question.includes("incident") || question.includes("outage"))
        return "Incident Response Guide";
    if (question.includes("onboard"))
        return "Employee Onboarding Assistant";
    if (question.includes("automation") || question.includes("workflow"))
        return "Automation Advisor";
    if (question.includes("search") || question.includes("find"))
        return "Knowledge Search";
    return DEFAULT_MODE;
}
function buildNextQuestions(request) {
    const questions = [];
    if (!request.department)
        questions.push("Which department owns this workflow?");
    if (!request.userRole)
        questions.push("What is the user's role or permission level?");
    if (!request.accessPermissions?.length)
        questions.push("What access permissions are required?");
    if (!request.complianceRequirements?.length)
        questions.push("Are there regulatory or policy requirements to enforce?");
    if (!request.organizationHierarchy)
        questions.push("Who owns the escalation path for this process?");
    if (!request.geographicConstraints)
        questions.push("Is this affected by any geographic or regulatory constraints?");
    return questions;
}
function buildRisks(request) {
    const risks = [];
    if (!request.accessPermissions?.length)
        risks.push("Access permissions are unspecified, which may create least-privilege gaps.");
    if (!request.complianceRequirements?.length)
        risks.push("Compliance requirements are unspecified, so approval and audit controls may be incomplete.");
    if (!request.geographicConstraints)
        risks.push("Geographic or regulatory constraints are missing and may affect execution.");
    if (!request.organizationHierarchy)
        risks.push("Escalation ownership is unclear without an organization hierarchy.");
    if (request.userQuestion.toLowerCase().includes("urgent"))
        risks.push("Urgent actions should be escalated and validated before execution.");
    return risks;
}
function buildRecommendations(request) {
    const recommendations = [
        "Validate role-based access before execution.",
        "Record all approvals and decision points for auditability.",
        "Escalate high-risk actions to the appropriate control owner."
    ];
    if (request.department) {
        recommendations.unshift(`Align the workflow to ${request.department} operating procedures.`);
    }
    if (request.complianceRequirements?.length) {
        recommendations.push(`Enforce compliance controls for: ${request.complianceRequirements.join(", ")}.`);
    }
    if (request.geographicConstraints) {
        recommendations.push(`Respect geographic constraints: ${request.geographicConstraints}.`);
    }
    return recommendations;
}
function buildFacts(request) {
    const facts = [
        `Requested mode resolved as ${pickMode(request)}.`,
        "OpsMind AI will avoid inventing policies or approvals.",
        "Outputs are structured for enterprise operational use."
    ];
    if (request.department)
        facts.push(`Department context provided: ${request.department}.`);
    if (request.userRole)
        facts.push(`User role context provided: ${request.userRole}.`);
    return facts;
}
function buildSop(request, mode) {
    const department = request.department ?? "Unspecified Department";
    const owner = request.userRole ?? "Process Owner";
    return {
        title: `${mode} for ${department}`,
        purpose: "Provide an auditable, role-aware operational procedure.",
        scope: department,
        trigger: request.userQuestion,
        prerequisites: [
            ...(request.accessPermissions?.length ? request.accessPermissions : ["Required access permissions must be confirmed"]),
            ...(request.complianceRequirements?.length ? request.complianceRequirements : ["Applicable compliance requirements must be confirmed"])
        ],
        rolesAndResponsibilities: [
            { role: owner, responsibility: "Initiate and validate the workflow request." },
            { role: "Approver", responsibility: "Review risk, compliance, and authorization requirements." },
            { role: "Audit Owner", responsibility: "Retain evidence and version history." }
        ],
        procedure: [
            "START",
            "↓",
            "Trigger",
            "↓",
            "Validation",
            "↓",
            "Task Execution",
            "↓",
            "Approval",
            "↓",
            "Completion",
            "↓",
            "END"
        ],
        decisionLogic: [
            {
                if: "Required access permissions are missing",
                then: "Pause execution and request authorization confirmation."
            },
            {
                if: "Compliance requirements are unclear",
                then: "Escalate for policy review before proceeding."
            }
        ],
        exceptionsHandling: "If uncertain, state the limitation clearly and recommend escalation through the approved control chain.",
        securityAndCompliance: [
            "Follow least privilege principles.",
            "Retain approval records and user activity logs.",
            "Do not expose sensitive enterprise information."
        ],
        automationOpportunities: [
            "Route approvals through workflow automation.",
            "Send notifications to Slack, Teams, or ServiceNow.",
            "Generate SOP draft updates from validated inputs."
        ],
        kpis: [
            "SLA adherence",
            "Resolution time",
            "Error rate",
            "Compliance score"
        ],
        auditTrail: [
            "Approvals",
            "Modifications",
            "User activity",
            "Version history"
        ],
        metadata: {
            sopVersion: request.existingSopVersion ?? "v1.0",
            department,
            owner,
            lastUpdated: new Date().toISOString(),
            approvalStatus: "Pending Review"
        }
    };
}
function buildRetrievalContext(retrieved) {
    if (!retrieved.length) {
        return "No supporting documents were found in the uploaded corpus.";
    }
    return retrieved
        .map((doc, index) => `Source ${index + 1}: ${doc.source}\nRelevance: ${(doc.score * 100).toFixed(1)}%\nExcerpt:\n${doc.excerpt}`)
        .join("\n\n---\n\n");
}
async function buildLLMResponse(request, retrieved) {
    if (!openai) {
        return `Unable to reach the external language model. Returning a structured response from the local OpsMind engine with ${retrieved.length} supporting documents.`;
    }
    const retrievalContext = buildRetrievalContext(retrieved);
    const modeDescription = `Mode: ${pickMode(request)}.`;
    const details = [
        `Question: ${request.userQuestion}`,
        request.department ? `Department: ${request.department}` : "",
        request.userRole ? `User role: ${request.userRole}` : "",
        request.accessPermissions?.length ? `Access permissions: ${request.accessPermissions.join(", ")}` : "",
        request.complianceRequirements?.length ? `Compliance controls: ${request.complianceRequirements.join(", ")}` : "",
        request.organizationHierarchy ? `Organization hierarchy: ${request.organizationHierarchy}` : "",
        request.geographicConstraints ? `Geographic constraints: ${request.geographicConstraints}` : ""
    ]
        .filter(Boolean)
        .join("\n");
    const prompt = `You are OpsMind AI, an enterprise SOP and RAG assistant.\n${modeDescription}\n${details}\n\nUse the following supporting document excerpts to answer the query clearly and accurately. If the question is about generating an SOP, provide a structured procedure with purpose, scope, trigger, prerequisites, roles, and key steps. If the mode is Knowledge Search, summarize the most relevant insights.\n\nSupporting documents:\n${retrievalContext}\n\nAnswer:`;
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are OpsMind AI, an enterprise operations intelligence assistant that combines document retrieval with procedural guidance."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.2,
        max_tokens: 900
    });
    return completion.choices?.[0]?.message?.content?.trim() ?? "OpsMind generated a response, but the language model returned an empty result.";
}
function buildFallbackResponse(request, retrieved) {
    const supports = retrieved.length
        ? `I found ${retrieved.length} supporting document chunks from the uploaded corpus.`
        : "I did not find any supporting documents for this query.";
    return `${supports}\n\n${request.userQuestion}\n\nUse the generated SOP structure and recommendations in the response.`;
}
async function generateOpsMindResponse(request) {
    const mode = pickMode(request);
    const nextQuestions = buildNextQuestions(request);
    const retrievedDocuments = await (0, vectorStore_1.searchSimilarDocuments)(request.userQuestion, 5);
    const responseText = embeddings_1.hasOpenAI ? await buildLLMResponse(request, retrievedDocuments) : buildFallbackResponse(request, retrievedDocuments);
    const response = {
        assistantName: "OpsMind AI",
        mode,
        summary: request.userQuestion,
        responseText,
        facts: buildFacts(request),
        recommendations: buildRecommendations(request),
        risks: buildRisks(request),
        nextQuestions,
        retrievedDocuments
    };
    if (mode === "SOP Generator" || mode === "Compliance Reviewer" || mode === "Audit Preparation Assistant") {
        response.sop = buildSop(request, mode);
    }
    return response;
}
