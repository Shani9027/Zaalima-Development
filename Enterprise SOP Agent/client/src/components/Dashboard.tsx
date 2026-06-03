import React, { useEffect, useState } from "react";
import { getStats } from "../services/api";
import "../styles/Dashboard.css";

interface ServiceHealth {
  status: string;
  service: string;
}

interface Stats {
  totalSOPs: number;
  totalQueries: number;
  successfulQueries: number;
  totalDocuments?: number;
}

export function Dashboard() {
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [healthRes, statsData] = await Promise.all([
          fetch("/health").then((res) => res.json()),
          getStats()
        ]);
        setHealth(healthRes);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setHealth({ status: "error", service: "opsmind-ai" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const successRate = stats && stats.totalQueries > 0 
    ? ((stats.successfulQueries / stats.totalQueries) * 100).toFixed(1)
    : "0";

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Service Status</h3>
          <div className={`status ${health?.status === "ok" ? "healthy" : "unhealthy"}`}>
            {loading ? "Checking..." : health?.status === "ok" ? "✓ Operational" : "✗ Offline"}
          </div>
        </div>

        <div className="stat-card">
          <h3>Total SOPs</h3>
          <div className="stat-value">{stats?.totalSOPs || 0}</div>
          <p className="stat-label">Generated procedures</p>
        </div>

        <div className="stat-card">
          <h3>Total Documents</h3>
          <div className="stat-value">{stats?.totalDocuments || 0}</div>
          <p className="stat-label">Ingested knowledge snippets</p>
        </div>

        <div className="stat-card">
          <h3>Total Queries</h3>
          <div className="stat-value">{stats?.totalQueries || 0}</div>
          <p className="stat-label">API requests processed</p>
        </div>

        <div className="stat-card">
          <h3>Success Rate</h3>
          <div className="stat-value">{successRate}%</div>
          <p className="stat-label">{stats?.successfulQueries || 0} successful queries</p>
        </div>
      </div>

      <div className="features-section">
        <h3>Available Modes & Features</h3>
        <ul className="features-list">
          <li><strong>SOP Generator</strong> - Create structured Standard Operating Procedures</li>
          <li><strong>Workflow Assistant</strong> - Optimize and manage workflows</li>
          <li><strong>Compliance Reviewer</strong> - Ensure regulatory adherence</li>
          <li><strong>Knowledge Search</strong> - Search enterprise knowledge base</li>
          <li><strong>Incident Response Guide</strong> - Structured incident handling</li>
          <li><strong>Employee Onboarding</strong> - Streamline new employee setup</li>
          <li><strong>Automation Advisor</strong> - Identify automation opportunities</li>
          <li><strong>Audit Preparation</strong> - Prepare for audits and compliance reviews</li>
        </ul>
      </div>

      <div className="info-section">
        <h3>Full-Stack Architecture</h3>
        <ul>
          <li>✓ <strong>Backend:</strong> Express.js with TypeScript</li>
          <li>✓ <strong>Database:</strong> In-memory store with query logging</li>
          <li>✓ <strong>Frontend:</strong> React + TypeScript + Vite</li>
          <li>✓ <strong>API:</strong> RESTful endpoints with Zod validation</li>
          <li>✓ <strong>Styling:</strong> Modern CSS with responsive design</li>
        </ul>
      </div>
    </div>
  );
}
