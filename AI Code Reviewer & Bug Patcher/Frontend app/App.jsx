import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState([]);
  const [review, setReview] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [patches, setPatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [securityReport, setSecurityReport] = useState(null);
  const [performanceReport, setPerformanceReport] = useState(null);
  const [activeTab, setActiveTab] = useState("single");

  const handleReview = async () => {
    if (!code.trim()) {
      alert("Please paste some code to review");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/review-code", { code });
      setReview(res.data.review || []);
    } catch (error) {
      console.error("Review error:", error);
      alert("Error fetching review: " + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const handleBugs = async () => {
    if (!code.trim()) {
      alert("Please paste some code to analyze");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/detect-bugs", { code });
      setBugs(res.data.bugs || []);
      setPatches(res.data.patches || []);
    } catch (error) {
      alert("Error fetching bugs: " + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const applyPatch = (patch) => {
    setCode(patch.updated_code);
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const filePromises = uploadedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            content: event.target.result,
            size: file.size
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then(loadedFiles => {
      setFiles(loadedFiles);
    });
  };

  const handleMultiFileReview = async () => {
    if (files.length === 0) {
      alert("Please upload files to review");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/review-multiple-files", { files });
      setReview(res.data);
    } catch (error) {
      alert("Error reviewing files: " + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const handleSecurityCheck = async () => {
    if (!code.trim()) {
      alert("Please paste some code to analyze");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/security-check", { code });
      setSecurityReport(res.data);
    } catch (error) {
      alert("Error checking security: " + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const handlePerformanceAnalysis = async () => {
    if (!code.trim()) {
      alert("Please paste some code to analyze");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/performance-analysis", { code });
      setPerformanceReport(res.data);
    } catch (error) {
      alert("Error analyzing performance: " + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>⚡ AI Code Reviewer</h2>

      <div className="tabs">
        <button onClick={() => setActiveTab("single")} className={activeTab === "single" ? "active" : ""}>📝 Single File</button>
        <button onClick={() => setActiveTab("multiple")} className={activeTab === "multiple" ? "active" : ""}>📁 Multiple Files</button>
        <button onClick={() => setActiveTab("advanced")} className={activeTab === "advanced" ? "active" : ""}>🛡️ Advanced Analysis</button>
      </div>

      {activeTab === "single" && (
        <div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
          />

          <div className="buttons">
            <button onClick={handleReview}>🔍 Review</button>
            <button onClick={handleBugs}>🐞 Bugs</button>
          </div>
        </div>
      )}

      {activeTab === "multiple" && (
        <div>
          <input type="file" multiple onChange={handleFileUpload} accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rb,.php,.cs" />
          {files.length > 0 && <p>📦 Files uploaded: {files.map(f => f.name).join(", ")}</p>}
          <button onClick={handleMultiFileReview}>📋 Review All Files</button>
        </div>
      )}

      {activeTab === "advanced" && (
        <div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code for advanced analysis..."
          />
          <div className="buttons">
            <button onClick={handleSecurityCheck}>🔐 Security Check</button>
            <button onClick={handlePerformanceAnalysis}>⚡ Performance Analysis</button>
          </div>
        </div>
      )}

      {loading && <p>⏳ Analyzing with Grok AI...</p>}

      <div className="output">
        {review.map((item, i) => (
          <div key={i} className={`card ${item.type}`}>
            <b>{item.type}</b>
            <p>{item.message}</p>
          </div>
        ))}

        {bugs.map((bug, i) => (
          <div key={i} className="card bug">
            <p><b>Line:</b> {bug.line}</p>
            <p>{bug.issue}</p>
            <p><b>Fix:</b> {bug.fix}</p>
          </div>
        ))}

        {patches.map((patch, i) => (
          <div key={i} className="card patch">
            <pre>{patch.updated_code}</pre>
            <button onClick={() => applyPatch(patch)}>Apply</button>
          </div>
        ))}

        {securityReport && (
          <div className="card security">
            <h3>🔐 Security Report</h3>
            <p><b>Score:</b> {securityReport.score}/100</p>
            {securityReport.vulnerabilities && securityReport.vulnerabilities.map((vuln, i) => (
              <div key={i} style={{ marginTop: '10px', padding: '10px', border: '1px solid #f0f0f0' }}>
                <p><b>{vuln.severity?.toUpperCase()}</b> - {vuln.type}</p>
                <p>{vuln.description}</p>
                <p style={{ color: 'green' }}><b>Fix:</b> {vuln.fix}</p>
              </div>
            ))}
          </div>
        )}

        {performanceReport && (
          <div className="card performance">
            <h3>⚡ Performance Analysis</h3>
            <p><b>Time Complexity:</b> {performanceReport.timeComplexity}</p>
            <p><b>Space Complexity:</b> {performanceReport.spaceComplexity}</p>
            <p><b>Performance:</b> {performanceReport.estimatedPerformance}</p>
            <p><b>Score:</b> {performanceReport.score}/100</p>
            {performanceReport.optimizations && performanceReport.optimizations.length > 0 && (
              <div>
                <h4>💡 Optimizations:</h4>
                {performanceReport.optimizations.map((opt, i) => <p key={i}>• {opt}</p>)}
              </div>
            )}
          </div>
        )}

        {review && review.files && review.files.length > 0 && (
          <div className="card multi-file-review">
            <h3>📁 Multi-File Analysis</h3>
            {review.files.map((file, i) => (
              <div key={i} style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd' }}>
                <p><b>{file.name}</b> - Score: {file.score}/100</p>
                {file.issues && file.issues.length > 0 && (
                  <div>
                    <h5>Issues:</h5>
                    {file.issues.map((issue, j) => <p key={j}>❌ {issue}</p>)}
                  </div>
                )}
                {file.improvements && file.improvements.length > 0 && (
                  <div>
                    <h5>Improvements:</h5>
                    {file.improvements.map((imp, j) => <p key={j}>✨ {imp}</p>)}
                  </div>
                )}
              </div>
            ))}
            {review.overall && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5' }}>
                <h4>📊 Overall Summary</h4>
                <p>{review.overall.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;