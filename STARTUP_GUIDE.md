# Getting Blank Page? Follow This Guide

This guide fixes the most common issue: **blank page after cloning from GitHub**.

## ✅ The Problem

You cloned the repo, but opening it in the browser shows a blank page with no errors.

**Why?** The app has a **backend API server** that must run separately. You can't just open the files in a browser.

## ✅ The Solution (3 Steps)

### Step 1: Check Prerequisites

Make sure you have Node.js installed:
```bash
node --version   # Should show v16.0.0 or higher
npm --version    # Should show 8.0.0 or higher
```

**Don't have Node.js?** [Download it here](https://nodejs.org/) (choose LTS)

### Step 2: Install Dependencies

Navigate to project folder and run:
```bash
npm install
```

Wait for it to finish (shows `added X packages`).

### Step 3: Set Up API Key

1. Get a **FREE** Mistral AI key (no credit card needed):
   - Go to https://console.mistral.ai/
   - Sign up (takes 2 minutes)
   - Create API key

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env     # Mac/Linux
   copy .env.example .env   # Windows Command Prompt
   ```

3. Edit `.env` file and add your key:
   ```
   MISTRAL_API_KEY=your_actual_key_here
   ```

### Step 4: Run the App

```bash
npm run dev:all
```

You'll see output like:
```
VITE v7.2.5  ready in 123 ms

➜  Local:   http://localhost:5173/
✅ Server running on http://localhost:5000
```

✅ **Open browser to `http://localhost:5173`**

## ❓ Still Getting Blank Page?

### Check 1: Both Servers Running?
Look at terminal output. You should see **BOTH**:
- `VITE...Local:   http://localhost:5173/` (frontend)
- `✅ Server running on http://localhost:5000` (backend)

If backend is missing, that's the problem!

### Check 2: API Key Set?
Verify `.env` file exists in project root:
```bash
cat .env      # Mac/Linux
type .env     # Windows
```

Should show:
```
PORT=5000
MISTRAL_API_KEY=sk_xxxxxxx...
```

If it shows nothing, you didn't set it up correctly. Go back to Step 2.

### Check 3: Clear Browser Cache
1. Press `Ctrl+Shift+Delete` to open cache clearing
2. Select "All time"
3. Check "Cookies and cached images"
4. Click "Clear data"
5. Reload the page (`Ctrl+R`)

### Check 4: Test Backend Directly
Open new terminal and run:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"healthy","apis":["mistral","groq","openai"]}
```

If you get "Connection refused", the backend server is NOT running.

### Check 5: Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Look for any red error messages
4. Take a screenshot and share it

## 🚀 Still Stuck?

Try these commands in order:

```bash
# Clear everything and start fresh
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall
npm install

# Verify backend can start
npm run server

# In another terminal, test the API
curl -X POST http://localhost:5000/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Nigeria?","state":"Lagos"}'
```

If the API response works, the backend is fine. Issue is frontend.

## ✨ Expected Behavior

When working correctly:
1. Homepage loads with search box
2. Enter question + select state
3. Click "Ask"
4. Results page shows answer with maps, images, videos
5. All text is visible, no blank areas

## 📧 Report Issues

If none of this works, please share:
1. Your `.env` file (without API key)
2. Terminal output when running `npm run dev:all`
3. Browser console errors (F12 → Console)
4. Screenshot of blank page
5. Your Node.js version (`node --version`)

GitHub Issues: https://github.com/Alaoh445/is-this-allowed/issues

---

**Remember:** This app needs BOTH frontend (5173) AND backend (5000) servers running. Don't just open HTML files in browser!
