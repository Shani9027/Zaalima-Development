import React from "react";
import type { OpsMindResponse } from "../../../src/types";
import "../styles/ResponseDisplay.css";

interface ResponseDisplayProps {
  response: OpsMindResponse;
}

export function ResponseDisplay({ response }: ResponseDisplayProps) {
  return (
    <div className="response-display">
      <div className="response-header">
        <h2>{response.summary}</h2>
        <span className="mode-badge">{response.mode}</span>
      </div>

      {response.responseText && (
        <section className="response-section">
          <h3>Executive Summary</h3>
          <p>{response.responseText}</p>
        </section>
      )}

      {response.facts.length > 0 && (
        <section className="response-section">
          <h3>Key Facts</h3>
          <ul className="facts-list">
            {response.facts.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
        </section>
      )}

      {response.recommendations.length > 0 && (
        <section className="response-section">
          <h3>Recommendations</h3>
          <ul className="recommendations-list">
            {response.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </section>
      )}

      {response.risks.length > 0 && (
        <section className="response-section risks">
          <h3>Risks & Considerations</h3>
          <ul className="risks-list">
            {response.risks.map((risk, idx) => (
              <li key={idx}>{risk}</li>
            ))}
          </ul>
        </section>
      )}

      {response.nextQuestions.length > 0 && (
        <section className="response-section">
          <h3>Next Questions</h3>
          <ul className="questions-list">
            {response.nextQuestions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </section>
      )}

      {response.retrievedDocuments && response.retrievedDocuments.length > 0 && (
        <section className="response-section sources-section">
          <h3>Source Documents</h3>
          <ul>
            {response.retrievedDocuments.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.source}</strong> — relevance {Math.round(doc.score * 100)}%
                <p>{doc.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {response.sop && (
        <section className="response-section sop-section">
          <h3>Standard Operating Procedure</h3>
          <div className="sop-content">
            <h4>{response.sop.title}</h4>
            <p><strong>Purpose:</strong> {response.sop.purpose}</p>
            <p><strong>Scope:</strong> {response.sop.scope}</p>
            <p><strong>Trigger:</strong> {response.sop.trigger}</p>

            {response.sop.prerequisites.length > 0 && (
              <>
                <h5>Prerequisites</h5>
                <ul>
                  {response.sop.prerequisites.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </>
            )}

            {response.sop.rolesAndResponsibilities.length > 0 && (
              <>
                <h5>Roles & Responsibilities</h5>
                <table className="roles-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Responsibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.sop.rolesAndResponsibilities.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.role}</td>
                        <td>{r.responsibility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <p><strong>Procedure:</strong> {response.sop.procedure.join(" → ")}</p>
          </div>
        </section>
      )}
    </div>
  );
}
