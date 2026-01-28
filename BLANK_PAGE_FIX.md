# Why You Got a Blank Page (And How to Fix It)

## 🎯 The Root Cause

When you cloned from GitHub and tried to run the app in a browser, you got a blank page because:

### ❌ What You Probably Did
```bash
git clone https://github.com/Alaoh445/is-this-allowed.git
# Opened the index.html file in your browser
# OR tried to run it without the backend server
```

### ✅ What You Should Do Instead
```bash
git clone https://github.com/Alaoh445/is-this-allowed.git
cd is-this-allowed
npm install                    # Install dependencies
cp .env.example .env          # Create config file
# Edit .env and add MISTRAL_API_KEY
npm run dev:all               # Start BOTH servers
# Then open http://localhost:5173 in browser
```

## 🔧 Why Both Servers Are Essential

This app has **TWO** parts that must run together:

### Part 1: Frontend (Vite/React)
- **Port**: 5173
- **Purpose**: Shows the user interface
- **Command**: `npm run dev`
- **Without it**: You can't see anything

### Part 2: Backend (Express API)
- **Port**: 5000
- **Purpose**: Handles AI requests to Mistral API
- **Command**: `npm run server`
- **Without it**: Questions won't get answers (blank page)

```
┌─────────────────────────────────────────────┐
│  Browser: http://localhost:5173             │
│  (Frontend - What you see)                  │
└──────────────────┬──────────────────────────┘
                   │ fetch("/api/answer")
                   ▼
┌──────────────────────────────────────────┐
│  Backend: http://localhost:5000          │
│  (API - Does the work)                   │
│  - Receives question                     │
│  - Calls Mistral AI API                  │
│  - Returns answer                        │
└──────────────────────────────────────────┘
```

## 🚨 Common Mistakes

### Mistake 1: Opening HTML File Directly
```bash
# ❌ WRONG - Just opens empty HTML
file:///C:/Users/YourName/is-this-allowed/index.html

# ✅ RIGHT - Opens the actual app
http://localhost:5173
```

### Mistake 2: Only Running Frontend
```bash
# ❌ WRONG - Frontend works but backend missing
npm run dev

# ✅ RIGHT - Both frontend and backend
npm run dev:all
```

### Mistake 3: No API Key Set
```bash
# ❌ WRONG - Missing .env file
# Backend starts but can't call Mistral AI
# You get "Error: API Key not found"

# ✅ RIGHT - .env file with key
MISTRAL_API_KEY=your_actual_key_here
```

## 📋 Step-by-Step Fix

### If You Already Have Blank Page

1. **Stop everything** (Ctrl+C in all terminals)

2. **Install dependencies** (if not done)
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env`** with your Mistral API key
   - Open `.env` in notepad/VS Code
   - Replace `your_mistral_key_here` with actual key
   - Save file

5. **Start both servers**
   ```bash
   npm run dev:all
   ```

6. **Wait for both to start**
   - You should see:
     ```
     VITE v7.2.5  ready in 123 ms
     ✅ Server running on http://localhost:5000
     ```

7. **Open browser**
   - Go to: `http://localhost:5173`
   - NOT: `http://localhost:5000` (that's just the API)
   - NOT: Open HTML files directly

8. **Test it**
   - You should see the search page
   - Type a question
   - Select a state
   - Click "Ask"
   - Get a response

## 🔍 If Still Blank

### Check 1: Are Both Servers Running?
Look at terminal. You need **BOTH**:
- `Local: http://localhost:5173/` from Vite
- `Server running on http://localhost:5000` from Express

If you see only one, you ran the wrong command.

### Check 2: Is .env Set Up?
```bash
# Windows Command Prompt
type .env

# Should show:
# PORT=5000
# MISTRAL_API_KEY=sk_xxxx...
```

### Check 3: Check Browser Console
Press `F12` to open Developer Tools:
- Go to "Console" tab
- Look for red error messages
- Common errors:
  - `Failed to fetch /api/answer` = Backend not running
  - `API Key not found` = .env not set
  - `Cannot read property 'answer'` = Server returning error

### Check 4: Test the Backend Directly
```bash
# In PowerShell or Terminal, test if backend is responding
curl -X POST http://localhost:5000/api/answer `
  -Headers @{"Content-Type" = "application/json"} `
  -Body '{"question":"What is Nigeria?","state":"Lagos"}'
```

If this works, backend is fine. Issue is frontend.

## 💡 Key Differences: Dev vs Production

### Development (What You're Using)
```bash
npm run dev:all
# Both servers run in foreground
# You see all logs and errors
# Auto-refresh on file changes
# Port 5173 for frontend, 5000 for backend
```

### Production (For Deployment)
```bash
npm run build
npm run preview
# Builds optimized version
# Runs from dist/ folder
# Should also start backend somehow
# Different port configuration
```

## 🎓 Learning Path

1. **Understand the structure**
   - Frontend = React app (5173)
   - Backend = Express API (5000)
   - Both needed for full functionality

2. **Get it working locally first**
   - npm run dev:all
   - http://localhost:5173
   - No blank page

3. **Then deploy to production**
   - npm run build
   - Deploy dist/ folder to hosting
   - Deploy server.js to backend hosting
   - Configure environment variables on hosting

## ✨ Success Indicators

When working correctly, you'll see:

✅ **Frontend**:
- Search box visible
- State selector dropdown
- "Ask" button

✅ **Backend**:
- Terminal shows: `✅ Server running on http://localhost:5000`

✅ **Integration**:
- Type question + select state + click "Ask"
- Page changes to results
- Answer, explanation, actions, sources visible
- Maps, images, videos displaying

❌ **If Broken**:
- Blank white page = Backend not running
- Error message = API key missing or wrong
- No response = Mistral API not configured

## 🆘 Still Stuck?

### Try Complete Reinstall
```bash
# Remove everything
rm -rf node_modules package-lock.json    # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# Fresh install
npm install

# Set up again
cp .env.example .env
# Edit .env with your key

# Start fresh
npm run dev:all
```

### Create Fresh Terminal Windows
```bash
# Terminal 1 - Frontend only
npm run dev

# Terminal 2 - Backend only
npm run server

# Then go to http://localhost:5173
```

### Verify Your Node.js
```bash
node --version     # Should be v16.0.0 or higher
npm --version      # Should be 8.0.0 or higher
```

## 📞 Get Help

If none of this works:

1. Check GitHub Issues: https://github.com/Alaoh445/is-this-allowed/issues
2. Share:
   - Terminal output when running `npm run dev:all`
   - Screenshot of blank page
   - Browser console errors (F12)
   - Your .env file (without API key)
   - Your Node.js version

---

**Remember**: This is a two-part app. Frontend alone = blank page. You MUST run both servers with `npm run dev:all`
