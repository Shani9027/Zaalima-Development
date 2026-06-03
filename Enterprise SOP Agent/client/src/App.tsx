import React, { useState } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { QueryForm } from "./components/QueryForm";
import { ResponseDisplay } from "./components/ResponseDisplay";
import { FileManager } from "./components/FileManager";
import type { OpsMindResponse } from "../../../src/types";
import "./styles/App.css";

export function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "query" | "files">("dashboard");
  const [response, setResponse] = useState<OpsMindResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <nav className="tabs">
          <button
            className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`tab ${activeTab === "query" ? "active" : ""}`}
            onClick={() => setActiveTab("query")}
          >
            Query OpsMind
          </button>
          <button
            className={`tab ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            Files
          </button>
        </nav>

        <main className="content">
          {activeTab === "dashboard" && <Dashboard />}

          {activeTab === "query" && (
            <div className="query-section">
              <QueryForm onSubmit={setResponse} setLoading={setLoading} setError={setError} />

              {loading && <div className="loading">Analyzing request...</div>}

              {error && <div className="error-message">{error}</div>}

              {response && <ResponseDisplay response={response} />}
            </div>
          )}

          {activeTab === "files" && <FileManager />}
        </main>
      </div>
    </div>
  );
}
