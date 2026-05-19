require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const apiKey = process.env.llama_api_key || process.env.Grok_api_key;
const llamaModel = process.env.llama_model || process.env.Grok_model || 'llama-2-70b-chat';
const apiBaseUrl = process.env.LLAMA_API_BASE || 'https://api.llama-api.com/v1';
const maxFiles = parseInt(process.env.MAX_FILES) || 10;
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 1048576;
const allowedExtensions = process.env.ALLOWED_EXTENSIONS?.split(',') || [];
const enableBatchReview = process.env.ENABLE_BATCH_REVIEW === 'true';
const enableSecurityCheck = process.env.ENABLE_SECURITY_CHECK === 'true';
const enablePerformanceAnalysis = process.env.ENABLE_PERFORMANCE_ANALYSIS === 'true';

if (!apiKey) {
    console.error("❌ API key not found. Please set llama_api_key or Grok_api_key in .env file");
} else {
    console.log("✅ API key loaded successfully");
}

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "Online", 
        message: "AI Code Reviewer API is running",
        endpoints: ["/api/message", "/api/config", "/review-code", "/detect-bugs"]
    });
});

app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from backend!" });
});

// Configuration endpoint - returns API info
app.get("/api/config", (req, res) => {
    res.json({ 
        apiBaseUrl: apiBaseUrl,
        llamaModel: llamaModel,
        maxFiles: maxFiles,
        version: "1.0.0"
    });
});

// Function to detect programming language from code
function detectProgrammingLanguage(code) {
    const langPatterns = {
        'javascript': /\b(const|let|var|function|async|await|=>|\.then|import|require)\b/,
        'python': /\b(def|class|import|from|if __name__|for|while|try|except|lambda)\b/,
        'java': /\b(public|private|class|void|static|new|import|package|extends)\b/,
        'cpp': /\b(#include|namespace|template|std::|cout|cin|vector|class|public:)\b/,
        'csharp': /\b(using|namespace|class|public|private|async|await|new|foreach)\b/,
        'php': /\b(<\?php|\$|function|class|namespace|use|require|include)\b/,
        'ruby': /\b(def|class|require|puts|attr_accessor|@|unless|elsif)\b/,
        'go': /\b(package|import|func|interface|defer|goroutine|chan)\b/,
        'rust': /\b(fn|let|mut|impl|trait|use|match|unwrap|Result|Option)\b/,
        'typescript': /\b(interface|type|namespace|declare|as|keyof|readonly|generic)\b/,
        'html': /\b(<html|<body|<div|<head|<meta|doctype)\b/,
        'css': /(\{[^}]*:\s*[^;};]*;|@media|selector)/,
        'sql': /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|GROUP BY|ORDER BY)\b/,
        'bash': /\b(#!(\/bin\/bash|\/usr\/bin\/env\s+bash)|echo|grep|sed|awk|export|source)\b/
    };

    let detectedLang = 'unknown';
    let maxMatches = 0;

    for (const [lang, pattern] of Object.entries(langPatterns)) {
        const matches = code.match(pattern);
        if (matches && matches.length > maxMatches) {
            maxMatches = matches.length;
            detectedLang = lang;
        }
    }

    return detectedLang;
}

// Language-specific prompt generator
function getReviewPrompt(code, language = 'en', programmingLanguage = 'unknown') {
    const prompts = {
        en: `You are an expert code reviewer specializing in ${programmingLanguage} code. Review the following code and provide feedback in JSON format with an array of objects. Each object should have "type" (feedback/warning/error/improvement) and "message" fields. Always provide at least 3 feedback items specific to ${programmingLanguage}.

Code to review:
\`\`\`${programmingLanguage}
${code}
\`\`\`

Return ONLY valid JSON array, no markdown, no explanations. Must include at least 3 items. Example format:
[{"type":"improvement","message":"Consider using const instead of let"},{"type":"feedback","message":"Good variable naming"},{"type":"warning","message":"Add error handling"}]`,

        es: `Eres un experto revisor de código especializado en código ${programmingLanguage}. Revisa el siguiente código y proporciona comentarios en formato JSON con un array de objetos. Cada objeto debe tener los campos "type" (feedback/warning/error/improvement) y "message". Proporciona siempre al menos 3 elementos de feedback específicos para ${programmingLanguage}.
Código a revisar:
\`\`\`${programmingLanguage}
${code}
\`\`\`
Devuelve SOLO un array JSON válido, sin markdown, sin explicaciones.`,



        fr: `Vous êtes un expert en révision de code spécialisé dans le code ${programmingLanguage}. Révisez le code suivant et fournissez vos commentaires au format JSON avec un tableau d'objets. Chaque objet doit avoir les champs "type" (feedback/warning/error/improvement) et "message". Fournissez toujours au moins 3 éléments de feedback spécifiques à ${programmingLanguage}.
Código à réviser:
\`\`\`${programmingLanguage}
${code}
\`\`\`
Retournez UNIQUEMENT un tableau JSON valide, pas de markdown, pas d'explications.`,

        de: `Sie sind ein Experte für Code-Reviews, der auf ${programmingLanguage}-Code spezialisiert ist. Überprüfen Sie den folgenden Code und geben Sie Feedback im JSON-Format mit einem Array von Objekten. Jedes Objekt sollte die Felder "type" (feedback/warning/error/improvement) und "message" haben. Geben Sie immer mindestens 3 Feedback-Elemente speziell für ${programmingLanguage} an.
Code zur Überprüfung:
\`\`\`${programmingLanguage}
${code}
\`\`\`
Geben Sie NUR ein gültiges JSON-Array zurück, kein Markdown, keine Erklärungen.
`,

        it: `Sei un esperto revisore di codice specializzato in codice ${programmingLanguage}. Rivedi il seguente codice e fornisci un feedback in formato JSON con un array di oggetti. Ogni oggetto dovrebbe avere i campi "type" (feedback/warning/error/improvement) e "message". Fornisci sempre almeno 3 elementi di feedback specifici per ${programmingLanguage}.
Codice da rivedere:
\`\`\`${programmingLanguage}
${code}
\`\`\`
Restituisci SOLO un array JSON valido, niente markdown, niente spiegazioni.
`,

        pt: `Você é um revisor de código especializado em código ${programmingLanguage}. Revise o código a seguir e forneça feedback no formato JSON com um array de objetos. Cada objeto deve ter os campos "type" (feedback/warning/error/improvement) e "message". Sempre forneça pelo menos 3 itens de feedback específicos para ${programmingLanguage}.
Código para revisar:
\`\`\`${programmingLanguage}
${code}
\`\`\`
Retorne APENAS um array JSON válido, sem markdown, sem explicações.
`,

        ru: `Вы эксперт по проверке кода, специализирующийся на коде ${programmingLanguage}. Просмотрите следующий код и предоставьте отзыв в формате JSON с массивом объектов. Каждый объект должен иметь поля "type" (feedback/warning/error/improvement) и "message". Всегда предоставляйте не менее 3 элементов отзыва, специфичных для ${programmingLanguage}.
Код для проверки:
\`\`\`${programmingLanguage}
${code}
\`\`\`
Возвращайте ТОЛЬКО валидный JSON-массив, без markdown, без объяснений.
`,

        ja: `あなたは${programmingLanguage}コードを専門とするエキスパートコードレビュアーです。次のコードをレビューし、オブジェクトの配列を含むJSON形式でフィードバックを提供してください。各オブジェクトには「type」（feedback/warning/error/improvement）と「message」フィールドが必要です。常に${programmingLanguage}に特化したフィードバック項目を少なくとも3つ提供してください。
レビューするコード：
\`\`\`${programmingLanguage}
${code}
\`\`\`
有効なJSON配列のみを返し、マークダウンや説明は含めないでください。
`,

        zh: `您是擅长 ${programmingLanguage} 代码的专家代码审查员。请审查以下代码并以包含对象数组的 JSON 格式提供反馈。每个对象应包含 "type"（feedback/warning/error/improvement）和 "message" 字段。请始终提供至少 3 个针对 ${programmingLanguage} 的反馈项。
待审查代码：
\`\`\`${programmingLanguage}
${code}
\`\`\`
仅返回有效的 JSON 数组，不要包含 Markdown 或说明。
`,

        hi: `आप ${programmingLanguage} कोड में विशेषज्ञता रखने वाले एक विशेषज्ञ कोड समीक्षक हैं। निम्नलिखित कोड की समीक्षा करें और ऑब्जेक्ट के सरणी के साथ JSON प्रारूप में प्रतिक्रिया प्रदान करें। प्रत्येक ऑब्जेक्ट में "type" (feedback/warning/error/improvement) और "message" फ़ील्ड होनी चाहिए। हमेशा ${programmingLanguage} के लिए विशिष्ट कम से कम 3 प्रतिक्रिया आइटम प्रदान करें।
समीक्षा के लिए कोड:
\`\`\`${programmingLanguage}
${code}
\`\`\`
केवल मान्य JSON सरणी लौटाएं, कोई मार्कडाउन नहीं, कोई स्पष्टीकरण नहीं।
`
    };
    
    return prompts[language] || prompts['en'];
}

function getBugPrompt(code, language = 'en', programmingLanguage = 'unknown') {
    const prompts = {
        en: `You are an expert code analyzer specializing in ${programmingLanguage} code. Find bugs and issues in the following code and provide fixes in JSON format. Return a JSON object with "bugs" array (with line, issue, fix) and "patches" array. Provide at least 2 bugs if they exist, or return empty arrays if code is clean.

Code to analyze:
\`\`\`${programmingLanguage}
${code}
\`\`\`

Return ONLY valid JSON:
{
  "bugs": [
    {"line": "5-10", "issue": "Potential null reference", "fix": "Add null check"}
  ],
  "patches": [
    {"updated_code": "// corrected code", "description": "Fixed issue"}
  ]
}`,

        es: `${programmingLanguage}.
\`\`\`${programmingLanguage}
${code}
\`\`\``,

        fr: ` ${programmingLanguage}. ".
        Code:
\`\`\`${programmingLanguage}
${code}
\`\`\``,

        de: `

Code:
\`\`\`
${code}
\`\`\``,

        it: `
\`\`\`
${code}
\`\`\``,

        pt: `
\`\`\`
${code}
\`\`\``,

        ru: `
\`\`\`
${code}
\`\`\``,

        ja: `
\`\`\`
${code}
\`\`\``,

        zh: `
\`\`\`
${code}
\`\`\``,

        hi: `
\`\`\`
${code}
\`\`\``
    };
    
    return prompts[language] || prompts['en'];
}

// Code Review Endpoint
app.post("/review-code", async (req, res) => {
    try {
        const { code, language = 'en', programmingLanguage } = req.body;
        
        if (!code || code.trim() === "") {
            return res.status(400).json({ 
                error: "Code cannot be empty",
                review: []
            });
        }

        // Check API key
        if (!apiKey) {
            console.error("API Key missing");
            return res.status(500).json({ 
                error: "API key not configured. Add llama_api_key to .env file",
                review: []
            });
        }

        // Detect language if not provided
        const detectedLang = programmingLanguage || detectProgrammingLanguage(code) || 'unknown';
        
        console.log(`Processing code review in language: ${language}, code type: ${detectedLang}`);

        const response = await axios.post(
            `${apiBaseUrl}/chat/completions`,
            {
                model: llamaModel,
                messages: [
                    {
                        role: "user",
                        content: getReviewPrompt(code, language, detectedLang)
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        const content = response.data.choices[0].message.content.trim();
        let review = [];
        
        try {
            // Try to parse JSON from response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                review = JSON.parse(jsonMatch[0]);
            } else {
                review = JSON.parse(content);
            }
            
            // Ensure review is an array and has at least one item
            if (!Array.isArray(review)) {
                review = [];
            }
            
            if (review.length === 0) {
                review = [{ type: "feedback", message: content || "Code analysis complete" }];
            }
        } catch (e) {
            console.error("JSON Parse error:", e.message);
            // Fallback: create feedback from raw response
            review = [{ 
                type: "feedback", 
                message: content.substring(0, 500) || "Analysis completed. Check backend logs for details."
            }];
        }

        console.log(`Review completed with ${review.length} items`);
        res.json({ review, language, success: true });
    } catch (error) {
        console.error("Review error:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.error?.message || error.message || "Unknown error occurred";
        res.status(500).json({ 
            error: errorMsg,
            review: [{
                type: "error",
                message: "Failed to connect to API. Check if API key is valid."
            }]
        });
    }
});

// Bug Detection Endpoint
app.post("/detect-bugs", async (req, res) => {
    try {
        const { code, language = 'en', programmingLanguage } = req.body;
        
        if (!code || code.trim() === "") {
            return res.status(400).json({ 
                error: "Code cannot be empty",
                bugs: [],
                patches: []
            });
        }

        // Check API key
        if (!apiKey) {
            console.error("API Key missing");
            return res.status(500).json({ 
                error: "API key not configured. Add llama_api_key to .env file",
                bugs: [],
                patches: []
            });
        }

        // Detect language if not provided
        const detectedLang = programmingLanguage || detectProgrammingLanguage(code) || 'unknown';
        
        console.log(`Processing bug detection in language: ${language}, code type: ${detectedLang}`);

        const response = await axios.post(
            `${apiBaseUrl}/chat/completions`,
            {
                model: llamaModel,
                messages: [
                    {
                        role: "user",
                        content: getBugPrompt(code, language, detectedLang)
                    }
                ],
                temperature: 0.5,
                max_tokens: 3000
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        const content = response.data.choices[0].message.content.trim();
        let result = { bugs: [], patches: [] };
        
        try {
            // Try to parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                result = JSON.parse(content);
            }
            
            // Ensure structure
            if (!result.bugs) result.bugs = [];
            if (!result.patches) result.patches = [];
        } catch (e) {
            console.error("JSON Parse error:", e.message);
            // If no bugs found, return empty arrays
            if (content.toLowerCase().includes("no bug") || content.toLowerCase().includes("clean") || content.toLowerCase().includes("looks good")) {
                result = { bugs: [], patches: [] };
            } else {
                result = { 
                    bugs: [{ 
                        line: "N/A", 
                        issue: content.substring(0, 300), 
                        fix: "Review response manually"
                    }],
                    patches: []
                };
            }
        }

        console.log(`Bug detection found ${result.bugs.length} issue(s)`);
        res.json({ ...result, language, success: true });
    } catch (error) {
        console.error("Bug detection error:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.error?.message || error.message || "Unknown error occurred";
        res.status(500).json({ 
            error: errorMsg,
            bugs: [],
            patches: []
        });
    }
});

// Multi-File Review Endpoint
app.post("/review-multiple-files", async (req, res) => {
    try {
        const { files } = req.body;
        
        if (!files || !Array.isArray(files)) {
            return res.status(400).json({ error: "Files array is required" });
        }

        if (files.length > maxFiles) {
            return res.status(400).json({ error: `Maximum ${maxFiles} files allowed` });
        }

        const results = [];
        const filesSummary = files.map(f => `\n=== ${f.name} ===\n\`\`\`\n${f.content}\n\`\`\``).join("\n");

        try {
            const response = await axios.post(
                `${apiBaseUrl}/chat/completions`,
                {
                    model: llamaModel,
                    messages: [
                        {
                            role: "user",
                            content: `You are an expert code reviewer analyzing multiple files. Review all the following files and provide comprehensive feedback.\n${filesSummary}\n\nProvide analysis in JSON format with structure: {\"files\": [{\"name\": \"filename\", \"issues\": [], \"improvements\": [], \"score\": 0-100}], \"overall\": {\"summary\": \"\", \"bestPractices\": [], \"concerns\": []}}`
                        }
                    ]
                },
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const content = response.data.choices[0].message.content;
            let analysis = {};
            
            try {
                analysis = JSON.parse(content);
            } catch (e) {
                analysis = { files: files.map(f => ({ name: f.name, issues: [], improvements: [content] })), overall: { summary: content } };
            }

            res.json(analysis);
        } catch (error) {
            console.error("Multi-file review error:", error.message);
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        console.error("Multi-file review error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Security Check Endpoint
app.post("/security-check", async (req, res) => {
    try {
        const { code, fileName } = req.body;
        
        if (!code || code.trim() === "") {
            return res.status(400).json({ error: "Code cannot be empty" });
        }

        const response = await axios.post(
            `${apiBaseUrl}/chat/completions`,
            {
                model: llamaModel,
                messages: [
                    {
                        role: "user",
                        content: `Perform a security analysis on this code (${fileName}). Check for: SQL injection, XSS vulnerabilities, hardcoded secrets, unsafe functions, authentication issues.\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nReturn JSON: {\"vulnerabilities\": [{\"severity\": \"critical/high/medium/low\", \"type\": \"\", \"line\": \"\", \"description\": \"\", \"fix\": \"\"}], \"score\": 0-100}`
                    }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const content = response.data.choices[0].message.content;
        let securityReport = {};
        
        try {
            securityReport = JSON.parse(content);
        } catch (e) {
            securityReport = { vulnerabilities: [], score: 0, notes: content };
        }

        res.json(securityReport);
    } catch (error) {
        console.error("Security check error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Performance Analysis Endpoint
app.post("/performance-analysis", async (req, res) => {
    try {
        const { code, fileName } = req.body;
        
        if (!code || code.trim() === "") {
            return res.status(400).json({ error: "Code cannot be empty" });
        }

        const response = await axios.post(
            `${apiBaseUrl}/chat/completions`,
            {
                model: llamaModel,
                messages: [
                    {
                        role: "user",
                        content: `Analyze the performance of this code (${fileName}). Check for: time complexity, space complexity, bottlenecks, algorithms efficiency, caching opportunities.\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nReturn JSON: {\"timeComplexity\": \"\", \"spaceComplexity\": \"\", \"bottlenecks\": [], \"optimizations\": [], \"estimatedPerformance\": \"fast/medium/slow\", \"score\": 0-100}`
                    }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const content = response.data.choices[0].message.content;
        let performanceReport = {};
        
        try {
            performanceReport = JSON.parse(content);
        } catch (e) {
            performanceReport = { timeComplexity: "N/A", spaceComplexity: "N/A", bottlenecks: [], notes: content };
        }

        res.json(performanceReport);
    } catch (error) {
        console.error("Performance analysis error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("🚀 Backend server running on http://localhost:" + PORT);
    console.log("📁 Max files:", maxFiles);
    console.log("🔒 Security check:", enableSecurityCheck);
    console.log("⚡ Performance analysis:", enablePerformanceAnalysis);
});