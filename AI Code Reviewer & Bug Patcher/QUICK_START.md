# QUICK START GUIDE

## 🚀 Fastest Way to Run the Application

### Step 1: Install Dependencies (First Time Only)
```bash
cd "Backend App"
npm install
cd ..
```

### Step 2: Run Quick Start
**Double-click** one of these files in your project folder:

#### Option A: Batch File (Recommended for Windows)
- **`quick-start.bat`** - Simplest method
  - Double-click and it runs everything automatically
  - Backend starts, HTML file opens
  - Backend stays running in terminal window

#### Option B: PowerShell Script
- **`quick-start.ps1`** - Works similarly to batch file
  - Right-click → "Run with PowerShell"
  - First time: You may need to allow script execution

#### Option C: Node.js Launcher
```bash
npm install
node launch.js
```

---

## 🎯 The Backend MUST Stay Running

When you run `quick-start.bat`, you'll see a black terminal window open. **This is the backend server - DO NOT CLOSE IT while using the application.**

The terminal will show:
```
🚀 Backend server running on http://localhost:5000
📁 Max files: 10
🔒 Security check: false
⚡ Performance analysis: false
```

---

## 📋 What Happens

1. **`quick-start.bat` launches and:**
   - Starts backend server on `http://localhost:5000`
   - Waits 5 seconds for backend to initialize
   - Opens `popup.html` in your default browser
   - Shows you a message

2. **Backend Terminal:**
   - Remains open and listening for requests
   - Shows logs of API calls from the frontend
   - Closes only when you exit or press Ctrl+C

3. **Frontend (Browser):**
   - Paste code in textarea
   - Click "Review" or "Bugs" buttons
   - See AI analysis powered by Grok API

---

## ⚙️ Setup Requirements

### Must Have:
- **Node.js** v14+ (https://nodejs.org/)
- **npm** (comes with Node.js)

### Must Configure:
- Create `Backend App/.env` file with:
  ```
  Grok_api_key=your_grok_api_key_here
  Grok_model=grok-2-latest
  ```

---

## 🔧 Manual Start (If Batch File Doesn't Work)

1. Open Command Prompt or PowerShell
2. Navigate to Backend App folder
3. Run: `npm start`
4. In another terminal, open: `Frontend app/popup.html`

---

## 💡 Usage Tips

- **Keep backend terminal running** - Frontend won't work without it
- **Port 5000** - This is where backend listens
- **Chrome Extension** - Can also load as extension via `chrome://extensions/`
- **File Size Limit** - Default 1MB per file

---

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Error connecting to backend" | Make sure backend terminal is running |
| Command not found: `node` | Install Node.js from nodejs.org |
| Port 5000 in use | Change port in Backend App/server.js |
| HTML won't open | Manually open Frontend app/popup.html in browser |
| API key error | Add valid Grok API key to .env file |

---

## 🎉 You're All Set!

Just double-click `quick-start.bat` every time you want to use the application. The backend will start automatically and your HTML file will open!
