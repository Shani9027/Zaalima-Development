import React, { useState } from "react";
import type { OpsMindRequest, OpsMindResponse, OpsMindMode } from "../../../src/types";
import { useOpsMindQuery } from "../hooks/useOpsMindQuery";
import "../styles/QueryForm.css";

const MODES: OpsMindMode[] = [
  "SOP Generator",
  "Workflow Assistant",
  "Compliance Reviewer",
  "Knowledge Search",
  "Incident Response Guide",
  "Employee Onboarding Assistant",
  "Automation Advisor",
  "Audit Preparation Assistant"
];

interface QueryFormProps {
  onSubmit: (response: OpsMindResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function QueryForm({ onSubmit, setLoading, setError }: QueryFormProps) {
  const [formData, setFormData] = useState<Partial<OpsMindRequest>>({
    userQuestion: "",
    mode: undefined,
    userRole: "",
    department: "",
    accessPermissions: [],
    organizationHierarchy: "",
    geographicConstraints: "",
    previousContext: "",
    existingSopVersion: ""
  });

  const { query } = useOpsMindQuery();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const permissions = e.target.value
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    setFormData((prev) => ({
      ...prev,
      accessPermissions: permissions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await query(formData as OpsMindRequest);
      onSubmit(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Query OpsMind AI</h3>

        <div className="form-group">
          <label htmlFor="userQuestion">
            Your Question <span className="required">*</span>
          </label>
          <textarea
            id="userQuestion"
            name="userQuestion"
            value={formData.userQuestion}
            onChange={handleInputChange}
            placeholder="Ask OpsMind AI for assistance..."
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mode">Mode</label>
            <select name="mode" value={formData.mode || ""} onChange={handleInputChange}>
              <option value="">Auto-detect</option>
              {MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="userRole">User Role</label>
            <input
              id="userRole"
              type="text"
              name="userRole"
              value={formData.userRole || ""}
              onChange={handleInputChange}
              placeholder="e.g., SRE, Manager, Analyst"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              type="text"
              name="department"
              value={formData.department || ""}
              onChange={handleInputChange}
              placeholder="e.g., Engineering, Operations"
            />
          </div>

          <div className="form-group">
            <label htmlFor="accessPermissions">Access Permissions</label>
            <input
              id="accessPermissions"
              type="text"
              value={formData.accessPermissions?.join(", ") || ""}
              onChange={handlePermissionsChange}
              placeholder="Comma-separated permissions"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="organizationHierarchy">Organization Hierarchy</label>
            <input
              id="organizationHierarchy"
              type="text"
              name="organizationHierarchy"
              value={formData.organizationHierarchy || ""}
              onChange={handleInputChange}
              placeholder="e.g., Team > Dept > Business Unit"
            />
          </div>

          <div className="form-group">
            <label htmlFor="geographicConstraints">Geographic Constraints</label>
            <input
              id="geographicConstraints"
              type="text"
              name="geographicConstraints"
              value={formData.geographicConstraints || ""}
              onChange={handleInputChange}
              placeholder="e.g., EU, US, APAC"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="previousContext">Previous Context</label>
            <textarea
              id="previousContext"
              name="previousContext"
              value={formData.previousContext || ""}
              onChange={handleInputChange}
              placeholder="Provide background or previous conversation context"
              rows={3}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="existingSopVersion">Existing SOP Version</label>
            <input
              id="existingSopVersion"
              type="text"
              name="existingSopVersion"
              value={formData.existingSopVersion || ""}
              onChange={handleInputChange}
              placeholder="e.g., v2.3"
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          Submit Query
        </button>
      </div>
    </form>
  );
}
