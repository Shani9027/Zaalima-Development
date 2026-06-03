import React, { useEffect, useState } from "react";
import { listFiles, uploadFile } from "../services/api";
import type { OpsMindFile } from "../../../src/types";
import "../styles/FileManager.css";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

export function FileManager() {
  const [files, setFiles] = useState<OpsMindFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      const fileList = await listFiles();
      setFiles(fileList);
    } catch (err) {
      console.error(err);
      setError("Unable to load files. Please try again.");
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] ?? "";
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setError("Please choose a file before uploading.");
      return;
    }

    setUploading(true);

    try {
      const contentBase64 = await readFileAsBase64(selectedFile);
      await uploadFile({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        size: selectedFile.size,
        contentBase64
      });
      setSuccess(`${selectedFile.name} uploaded successfully.`);
      setSelectedFile(null);
      loadFiles();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <div>
          <h2>Files</h2>
          <p>Upload and manage documents that support your OpsMind workflows.</p>
        </div>
      </div>

      <form className="file-upload-form" onSubmit={handleUpload}>
        <div className="upload-row">
          <label className="file-input-label">
            <span>Select a file</span>
            <input type="file" onChange={handleFileChange} />
          </label>
          <button type="submit" className="upload-button" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>

        {selectedFile && (
          <div className="upload-preview">
            <strong>Ready to upload:</strong> {selectedFile.name} • {formatBytes(selectedFile.size)}
          </div>
        )}

        {error && <div className="file-error">{error}</div>}
        {success && <div className="file-success">{success}</div>}
      </form>

      <section className="file-list-card">
        <div className="file-list-header">
          <h3>Uploaded Files</h3>
          <span>{files.length} files available</span>
        </div>

        {files.length === 0 ? (
          <div className="empty-state">No files uploaded yet. Start by choosing a file above.</div>
        ) : (
          <table className="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.fileName}</td>
                  <td>{file.fileType || "Unknown"}</td>
                  <td>{formatBytes(file.size)}</td>
                  <td>{formatDate(file.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
