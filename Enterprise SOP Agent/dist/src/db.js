"use strict";
// Simple in-memory database for OpsMind AI
// For production, you could use SQLite or any other database
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.saveSOPEntry = saveSOPEntry;
exports.getSOPEntry = getSOPEntry;
exports.listSOPEntries = listSOPEntries;
exports.saveFileEntry = saveFileEntry;
exports.getFileEntry = getFileEntry;
exports.listFileEntries = listFileEntries;
exports.logQuery = logQuery;
exports.getQueryLogs = getQueryLogs;
exports.getStats = getStats;
let sopCounter = 0;
let queryCounter = 0;
let fileCounter = 0;
const sopEntries = [];
const queryLogs = [];
const fileEntries = [];
function initializeDatabase() {
    // Initialize in-memory database
    console.log("✓ In-memory database initialized");
}
function saveSOPEntry(entry) {
    const id = ++sopCounter;
    sopEntries.push({
        ...entry,
        id,
        createdAt: new Date().toISOString()
    });
    return id;
}
function getSOPEntry(id) {
    return sopEntries.find((entry) => entry.id === id) || null;
}
function listSOPEntries(department, limit = 20) {
    let results = [...sopEntries].reverse();
    if (department) {
        results = results.filter((entry) => entry.department === department);
    }
    return results.slice(0, limit);
}
function saveFileEntry(entry) {
    const id = ++fileCounter;
    fileEntries.push({
        ...entry,
        id,
        uploadedAt: new Date().toISOString()
    });
    return id;
}
function getFileEntry(id) {
    return fileEntries.find((entry) => entry.id === id) || null;
}
function listFileEntries(limit = 50) {
    return [...fileEntries]
        .reverse()
        .slice(0, limit)
        .map(({ contentBase64, ...entry }) => entry);
}
function logQuery(log) {
    const id = ++queryCounter;
    queryLogs.push({
        ...log,
        id,
        createdAt: new Date().toISOString()
    });
    return id;
}
function getQueryLogs(limit = 50) {
    return [...queryLogs].reverse().slice(0, limit);
}
function getStats() {
    const totalQueries = queryLogs.length;
    const successfulQueries = queryLogs.filter((q) => q.status === "success").length;
    return {
        totalSOPs: sopEntries.length,
        totalQueries,
        successfulQueries
    };
}
