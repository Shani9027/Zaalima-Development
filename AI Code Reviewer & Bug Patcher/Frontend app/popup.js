const reviewBtn = document.getElementById("reviewBtn");
const bugBtn = document.getElementById("bugBtn");
const clearBtn = document.getElementById("clearBtn");
const output = document.getElementById("output");
const codeInput = document.getElementById("code");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const languageSelect = document.getElementById("language");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");

// Settings elements
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const closeSettingsBtnTop = document.getElementById("closeSettingsBtnTop");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const apiUrlInput = document.getElementById("apiUrlInput");

// Get API URL from environment or use default
let API_BASE_URL = localStorage.getItem('API_BASE_URL') || "http://localhost:5000";
if (apiUrlInput) apiUrlInput.value = API_BASE_URL;

// Settings logic
if (settingsBtn) settingsBtn.onclick = () => settingsModal.style.display = "block";
const closeSettings = () => { if (settingsModal) settingsModal.style.display = "none"; };
if (closeSettingsBtn) closeSettingsBtn.onclick = closeSettings;
if (closeSettingsBtnTop) closeSettingsBtnTop.onclick = closeSettings;
window.onclick = (event) => { if (event.target == settingsModal) closeSettings(); };

if (saveSettingsBtn) {
    saveSettingsBtn.onclick = () => {
        API_BASE_URL = apiUrlInput.value.trim() || "http://localhost:5000";
        localStorage.setItem('API_BASE_URL', API_BASE_URL);
        closeSettings();
        checkBackendStatus();
    };
}

// Clear logic
if (clearBtn) {
    clearBtn.onclick = () => {
        codeInput.value = '';
        clearOutput();
        hideMessages();
    };
}

// Function to get language-specific review UI language
function getReviewUILanguage() {
    return 'en';
}

// Check backend connection status
async function checkBackendStatus() {
    try {
        console.log("Checking backend status at:", `${API_BASE_URL}/api/message`);
        const response = await fetch(`${API_BASE_URL}/api/message`, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            statusIndicator.className = 'status-indicator status-online';
            statusText.textContent = 'Backend Connected';
            return true;
        } else {
            throw new Error('Backend not responding');
        }
    } catch (error) {
        statusIndicator.className = 'status-indicator status-offline';
        statusText.textContent = 'Backend Offline';
        return false;
    }
}

// Initial status check
checkBackendStatus();
setInterval(checkBackendStatus, 10000);

// Show error message
function showError(message) {
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = '✓ ' + message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Hide messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Clear output
function clearOutput() {
    output.innerHTML = '';
}

// Show loading state
function showLoading(msg = "Analyzing your code...") {
    clearOutput();
    output.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 16px; color: var(--text-secondary);">
            <div class="loading-spinner"></div>
            <p>${msg}</p>
        </div>
    `;
}

// Review Code
reviewBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    const programmingLanguage = languageSelect.value;
    const reviewUILanguage = getReviewUILanguage();

    if (!code) {
        showError("Please paste some code to review");
        return;
    }

    hideMessages();
    showLoading("Reviewing code quality...");

    try {
        const response = await fetch(`${API_BASE_URL}/review-code`, {
            method: "POST",
            mode: 'cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                code: code,
                language: reviewUILanguage,
                programmingLanguage: programmingLanguage
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayReviewResults(data.review);
            showSuccess("Code review completed");
        } else {
            showError(data.error || "Failed to review code");
            clearOutput();
        }
    } catch (error) {
        showError("Network error. Please check if the backend is running.");
        clearOutput();
    }
});

// Find Bugs
bugBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    const programmingLanguage = languageSelect.value;

    if (!code) {
        showError("Please paste some code to analyze");
        return;
    }

    hideMessages();
    showLoading("Scanning for bugs and vulnerabilities...");

    try {
        const response = await fetch(`${API_BASE_URL}/detect-bugs`, {
            method: "POST",
            mode: 'cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                code: code,
                programmingLanguage: programmingLanguage
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayBugResults(data);
            showSuccess("Bug detection completed");
        } else {
            showError(data.error || "Failed to detect bugs");
            clearOutput();
        }
    } catch (error) {
        showError("Network error. Please check if the backend is running.");
        clearOutput();
    }
});

function displayReviewResults(reviews) {
    clearOutput();
    if (!reviews || reviews.length === 0) {
        output.innerHTML = '<div class="message success">No issues found! Your code looks good.</div>';
        return;
    }

    reviews.forEach(item => {
        const card = document.createElement("div");
        card.className = `feedback-card ${item.type || 'feedback'}`;
        card.innerHTML = `
            <div class="card-type">${item.type || 'Feedback'}</div>
            <div class="card-message">${item.message}</div>
        `;
        output.appendChild(card);
    });
}

function displayBugResults(data) {
    clearOutput();
    const bugs = data.bugs || [];
    const patches = data.patches || [];

    if (bugs.length === 0 && patches.length === 0) {
        output.innerHTML = '<div class="message success">No bugs detected!</div>';
        return;
    }

    bugs.forEach(bug => {
        const bugItem = document.createElement("div");
        bugItem.className = "bug-item";
        bugItem.innerHTML = `
            <div class="bug-header">
                <div class="card-type">Bug Found</div>
                <div class="bug-line">Line: ${bug.line || 'N/A'}</div>
            </div>
            <div style="margin-bottom: 12px; font-weight: 600;">${bug.issue}</div>
            <div style="font-size: 13px; color: var(--text-secondary);"><span style="color: var(--accent-color);">Fix:</span> ${bug.fix}</div>
        `;
        output.appendChild(bugItem);
    });

    patches.forEach(patch => {
        const patchCard = document.createElement("div");
        patchCard.className = "patch-card";
        patchCard.innerHTML = `
            <div class="patch-header">Suggested Fix</div>
            <div class="patch-code">
                <pre><code>${escapeHtml(patch.updated_code)}</code></pre>
            </div>
            <div style="padding: 12px 16px; font-size: 13px; color: var(--text-secondary); border-top: 1px solid var(--border-color);">
                ${patch.description}
            </div>
        `;
        output.appendChild(patchCard);
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
