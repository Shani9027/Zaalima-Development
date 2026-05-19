# 🤖 AI Code Reviewer

An intelligent code review tool powered by Grok AI that automatically reviews code, detects bugs, and provides fixes.

## 📁 Project Structure

```
ai_code_reviewer/
├── Backend App/
│   ├── server.js              # Express backend server
│   ├── package.json           # Dependencies
│   ├── .env                   # Configuration (create this)
│   └── start-backend.bat      # Backend starter script
├── Frontend app/
│   ├── popup.html             # Main UI
│   ├── popup.js               # Frontend logic
│   ├── App.jsx                # React component
│   ├── App.css                # Styles
│   └── manifest.json          # Chrome extension config
├── quick-start.bat            # ⭐ AUTO-START ALL (USE THIS!)
├── QUICK_START.md             # Fast setup guide
├── SETUP.md                   # Detailed setup guide
└── README.md                  # This file
```

## 🚀 Quick Start (30 Seconds)

### Step 1: First Time Setup
```bash
cd "Backend App"
npm install
cd ..
```

### Step 2: Start Everything
**Double-click:** `quick-start.bat`

That's it! Backend will start on port 5000 and Frontend will start on port 3000 automatically.

---

## 🛠️ Development

### Backend
```bash
cd "Backend App"
node server.js
```

### Frontend
```bash
cd "Frontend app"
npm install
npm run dev
```

## ⚙️ Requirements

- **Node.js v14+** - [Download](https://nodejs.org/)
- **Grok API Key** - [Get one](https://console.x.ai/)

## 📝 Configuration

Create a `.env` file in the `Backend App` folder:

```env
Grok_api_key=your_api_key_here
Grok_model=grok-2-latest
MAX_FILES=10
MAX_FILE_SIZE=1048576
ENABLE_BATCH_REVIEW=true
ENABLE_SECURITY_CHECK=true
ENABLE_PERFORMANCE_ANALYSIS=true
```

## ✨ Features

### 1. Code Review
- Analyzes code quality
- Provides improvement suggestions
- Identifies best practices

### 2. Bug Detection
- Finds bugs and issues
- Suggests fixes
- Provides corrected code

### 3. Multi-File Review
- Review multiple files at once
- Batch processing
- Detailed reports

### 4. Security Analysis
- Vulnerability scanning
- Security recommendations
- Risk assessment

### 5. Performance Analysis
- Time complexity analysis
- Space complexity check
- Optimization suggestions

---

## 🎯 How It Works

```
User opens popup.html
        ↓
Frontend calls Backend API (port 5000)
        ↓
Backend processes code with Grok AI
        ↓
Returns analysis results
        ↓
Frontend displays results
```

## 📡 API Endpoints

### Review Code
```
POST /review-code
Body: { "code": "your code here" }
```

### Detect Bugs
```
POST /detect-bugs
Body: { "code": "your code here" }
```

### Review Multiple Files
```
POST /review-multiple-files
Body: { "files": [...] }
```

### Security Check
```
POST /security-check
Body: { "code": "your code here" }
```

### Performance Analysis
```
POST /analyze-performance
Body: { "code": "your code here", "fileName": "file.js" }
```

---

## 🔧 Manual Start

If `quick-start.bat` doesn't work:

### Terminal 1 (Backend):
```bash
cd "Backend App"
npm start
```

### Terminal 2 (Open HTML):
```bash
# Windows:
start "Frontend app\popup.html"

# Or open manually in browser:
# File → Open → Frontend app/popup.html
```

---

## 🔌 Chrome Extension Setup

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select the `Frontend app` folder
5. Extension appears in top-right corner

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Error connecting to backend" | 1. Check backend terminal is running<br>2. Verify port 5000 is not in use<br>3. Restart backend |
| `node: command not found` | Install Node.js from nodejs.org |
| `npm: ERR! code ENOENT` | Run `npm install` in Backend App folder |
| API key error | Add valid Grok API key to .env |
| HTML won't load | Browser must be on same machine as backend |
| Port 5000 already in use | Change PORT in server.js or: `set PORT=3000 && npm start` |

---

## 📊 Port Configuration

- **Backend Server:** `http://localhost:5000` (configurable via .env)
- **Frontend:** Opens as file or Chrome extension

To change port:
```javascript
// Backend App/server.js
const PORT = process.env.PORT || 5000;
```

---

## 🔐 Security Notes

- Backend never leaves your local machine
- API calls go directly to Grok API
- No data stored or logged
- CORS enabled for localhost only

---

## 📦 Dependencies

### Backend
- `express` - Web framework
- `axios` - HTTP client
- `cors` - Cross-origin support
- `dotenv` - Environment variables

### Frontend
- React (optional, in App.jsx)
- Vanilla JavaScript

---

## 🎓 Usage Example

1. **Paste Code:**
   ```javascript
   function sum(a, b) {
       return a + c;  // Bug: should be 'b'
   }
   ```

2. **Click "Bugs"**

3. **Get Results:**
   ```
   Issue: Variable 'c' is undefined
   Fix: Change 'c' to 'b'
   ```

---

## 🚀 Advanced Setup

### Windows Service (Auto-Start on Boot)
```bash
node windows-service-setup.js install
```

### Create Desktop Shortcuts
```bash
node create-shortcuts.js
```

### Development Mode
```bash
cd "Backend App"
npm install -g nodemon
npm run dev
```

---

## 📝 License

ISC License

## 👨‍💻 Author

Created for code review automation using AI

---

## ❓ FAQ

**Q: Do I need to restart the backend after each analysis?**
- No, it stays running and handles multiple requests

**Q: Can I use this offline?**
- No, Grok API requires internet connection

**Q: What's the file size limit?**
- Default 1MB (configurable in .env)

**Q: Can multiple users use this?**
- Yes, all from the same machine while backend is running

**Q: Is my code sent to external servers?**
- Yes, to Grok API for analysis. Keep your API key secret.

---

## 🆘 Need Help?

1. Check `QUICK_START.md` for fast setup
2. Check `SETUP.md` for detailed guide
3. Review error messages in browser console (F12)
4. Check backend terminal for server logs

---

**Ready? Double-click `quick-start.bat` to start!** 🚀
