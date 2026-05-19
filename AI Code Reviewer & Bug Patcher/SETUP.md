# AI Code Reviewer - Setup Guide

## Quick Start (Recommended)

### Option 1: Auto-Start Script (Easiest)
1. **Double-click** `quick-start.bat` in the root folder
2. This will:
   - Automatically start the backend server
   - Open the `popup.html` file in your browser
   - Keep running until you close the terminal window

### Option 2: Manual Start
1. **Start Backend:**
   - Open Command Prompt/PowerShell
   - Navigate to `Backend App` folder
   - Run: `npm install` (first time only)
   - Run: `npm start` (or `node server.js`)
   - Backend will run on `http://localhost:5000`

2. **Open Frontend:**
   - Open `Frontend app\popup.html` in your web browser
   - OR load it as a Chrome Extension:
     - Go to `chrome://extensions/`
     - Enable "Developer mode"
     - Click "Load unpacked"
     - Select the `Frontend app` folder

## Requirements
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Backend API Key:**
  - Create a `.env` file in `Backend App` folder with:
    ```
    Grok_api_key=your_api_key_here
    Grok_model=grok-2-latest
    ```

## Features
- ✔️ Code Review using Grok AI
- ✔️ Bug Detection and Fixes
- ✔️ Multi-file Analysis
- ✔️ Security Analysis
- ✔️ Performance Analysis

## Troubleshooting

### "Error connecting to backend"
- Make sure backend is running on port 5000
- Check if Node.js is installed: `node --version`
- Check permissions - allow popup.html in security settings

### Port 5000 Already in Use
In `Backend App\server.js`, the port can be changed:
```javascript
const PORT = process.env.PORT || 5000;
```
Set environment variable: `set PORT=3000` before starting

### Chrome Extension Not Loading
- The extension needs to access `http://localhost:5000`
- Allow it in browser permissions if prompted

## Background Service Setup (Advanced)

To make the backend start automatically on Windows startup:
1. Use Windows Task Scheduler
2. Create a task that runs: `node "C:\path\to\Backend App\server.js"`
3. Set it to run at startup

Or install as Windows Service:
```bash
npm install -g node-windows
node ./node-windows-setup.js
```
