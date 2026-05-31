export type OpsMindMode =
  | "SOP Generator"
  | "Workflow Assistant"
  | "Compliance Reviewer"
  | "Knowledge Search"
  | "Incident Response Guide"
  | "Employee Onboarding Assistant"
  | "Automation Advisor"
  | "Audit Preparation Assistant";

export interface OpsMindRequest {
  userRole?: string;
  department?: string;
  accessPermissions?: string[];
  organizationHierarchy?: string;
  previousContext?: string;
  existingSopVersion?: string;
  complianceRequirements?: string[];
  geographicConstraints?: string;
  mode?: OpsMindMode;
  userQuestion: string;
}

export interface OpsMindSection {
  title: string;
  content: string;
}

export interface OpsMindFile {
  id: number;
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  contentBase64?: string;
}

export interface OpsMindResponse {
  assistantName: "OpsMind AI";
  mode: OpsMindMode;
  summary: string;
  responseText?: string;
  facts: string[];
  recommendations: string[];
  risks: string[];
  nextQuestions: string[];
  retrievedDocuments?: Array<{
    id: number;
    fileId: number;
    source: string;
    excerpt: string;
    score: number;
  }>;
  sop?: {
    title: string;
    purpose: string;
    scope: string;
    trigger: string;
    prerequisites: string[];
    rolesAndResponsibilities: Array<{ role: string; responsibility: string }>;
    procedure: string[];
    decisionLogic: Array<{ if: string; then: string }>;
    exceptionsHandling: string;
    securityAndCompliance: string[];
    automationOpportunities: string[];
    kpis: string[];
    auditTrail: string[];
    metadata: {
      sopVersion: string;
      department: string;
      owner: string;
      lastUpdated: string;
      approvalStatus: string;
    };
  };
}
