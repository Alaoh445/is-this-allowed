# Troubleshooting Checklist - Before Opening a GitHub Issue

If you're having problems, work through this checklist **before** asking for help. It will solve 95% of issues.

## ✅ The Basics (Do This First)

### 1. Do You Have Node.js Installed?
```bash
node --version
npm --version
```
**Expected**: v16.0.0 or higher for Node, v8.0.0+ for npm

**If missing**: [Download Node.js](https://nodejs.org/) (choose LTS version)

**If wrong version**: Uninstall and reinstall Node.js

### 2. Did You Install Dependencies?
```bash
npm install
```
**Expected**: Completes without errors, shows "added X packages"

**If error**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. Did You Create .env File?
```bash
ls -la .env    # Mac/Linux
dir .env       # Windows Command Prompt
```
**Expected**: File exists in project root

**If missing**:
```bash
cp .env.example .env
```

### 4. Did You Add API Key to .env?
```bash
cat .env       # Mac/Linux
type .env      # Windows
```
**Expected**: 
```
MISTRAL_API_KEY=sk_xxxxxxxxxxxxxxxx
```

**NOT**:
```
MISTRAL_API_KEY=your_mistral_key_here
```

**If empty**:
1. Go to https://console.mistral.ai/
2. Create free account (no credit card!)
3. Generate API key
4. Edit `.env` and paste it
5. Save file

### 5. Are You Running Both Servers?
```bash
npm run dev:all
```
**Expected output** (wait 10 seconds):
```
VITE v7.2.5 ready in 123 ms
➜ Local: http://localhost:5173/
✅ Server running on http://localhost:5000
```

**If you see only one**: That's the problem! You need both.

### 6. Are You Opening the Right URL?
```
✓ http://localhost:5173 (CORRECT)
✗ http://localhost:5000 (WRONG - shows API only)
✗ file:///C:/path/to/index.html (WRONG - no backend)
```

**Open**: **http://localhost:5173** in browser

---

## 🔍 If You Still Have a Blank Page

### Check 1: Terminal Output
Kill current process (Ctrl+C) and run again:
```bash
npm run dev:all
```

**Copy the ENTIRE output** and check for:
- ❌ `error` (red text) = something is broken
- ❌ `ENOENT` = file not found (wrong directory?)
- ❌ `Cannot find module` = missing dependency
- ✓ Two messages about port 5173 and 5000 = GOOD

### Check 2: Browser Console
1. Press `F12` to open Developer Tools
2. Click "Console" tab
3. Look for **red error messages**

**Common errors & fixes**:
| Error | Fix |
|-------|-----|
| `Failed to fetch /api/answer` | Backend not running (npm run dev:all) |
| `CORS error` | Backend not running or frontend not proxying correctly |
| `Uncaught SyntaxError` | Bad .env format or missing file |
| `Cannot read property 'answer'` | API returned error (check server logs) |

### Check 3: API Directly
Test if backend is actually responding:
```bash
# Open new terminal window and run:
curl http://localhost:5000/api/health

# Windows PowerShell:
Invoke-WebRequest -Uri http://localhost:5000/api/health

# Or try from browser:
# http://localhost:5000/api/health
```

**Expected**: 
```json
{"status":"healthy","apis":["mistral","groq","openai"]}
```

**If "Connection refused"**: Backend is NOT running. Run `npm run dev:all`

### Check 4: Vite Dev Server
1. Press `F12` in browser (Developer Tools)
2. Go to "Network" tab
3. Reload page (Ctrl+R)
4. Look at network requests

**Expected**: 
- ✓ index.html: Status 200
- ✓ main.jsx: Status 200
- ✓ Other .js files: Status 200

**If all red (404)**: Vite server not serving files correctly. Restart npm.

### Check 5: Clear Everything
```bash
# Stop all running processes
# Ctrl+C in all terminals

# Clear npm cache
npm cache clean --force

# Remove dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Kill any processes on ports 5173 and 5000
# Windows PowerShell:
Stop-Process -Name node -Force

# Mac/Linux:
pkill node

# Start fresh
npm run dev:all
```

---

## 🎯 If You Get API Errors

### Error: "API Key not configured"

**Check 1**: .env file exists
```bash
ls .env    # or: dir .env on Windows
```

**Check 2**: .env has correct format
```bash
cat .env
# Should show:
# PORT=5000
# MISTRAL_API_KEY=sk_xxxxxx
```
(NOT: `your_mistral_key_here`)

**Check 3**: API key is valid
- Go to https://console.mistral.ai/
- Check if your key is still active
- Keys can expire if account is inactive

### Error: "Invalid API Key"

**Check 1**: Key is correctly copied
- Go to Mistral console
- Copy key again
- Edit .env
- Paste exactly (no spaces before/after)

**Check 2**: Restart backend
```bash
# Ctrl+C to stop all
# Then:
npm run dev:all
```

---

## ⚡ If Responses Are Slow

This is **normal** for free tier! Mistral free tier can take 5-10 seconds per response.

**However, if it's taking >20 seconds**:
1. Check internet connection
2. Try a simpler question
3. Restart backend (Ctrl+C then npm run dev:all)
4. Clear browser cache (Ctrl+Shift+Delete)

---

## 🔌 If Maps/Images/Videos Don't Show

### Check 1: Answer loads but no media?
This is partly normal - Mistral might not always return media.

**Check 2**: Browser console has errors about loading images
Press F12 and look for errors like `Failed to load image from X`

**Check 3**: Try a question that should have media
```
"What is Lagos?"        (should show map)
"What is Nigeria flag?" (should show image)
"How to cook jollof"    (might show video)
```

### Check 4**: Ad blockers / Security extensions
Disable temporarily to see if they're blocking media loading.

---

## 📊 Performance Checks

### App is slow?
```bash
# Check 1: Terminal output while running request
# Look for: "✓ Got Mistral response in XXXms"
# If >5000ms: Normal, Mistral is thinking

# Check 2: Check your internet speed
# Open: speedtest.net
# If slow: app will be slow

# Check 3: Check CPU/Memory usage
# Activity Monitor (Mac) or Task Manager (Windows)
# If maxed out: Restart computer
```

---

## 🐛 Before Opening GitHub Issue

If nothing above fixed it, gather this information:

```bash
# 1. Your Node.js version
node --version

# 2. Your npm version  
npm --version

# 3. Output of npm run dev:all
npm run dev:all
# (Let it run for 10 seconds, then Ctrl+C and paste output)

# 4. Your .env file (WITHOUT the actual API key!)
cat .env | sed 's/sk_.*/sk_XXXXXXX/'

# 5. Check if you can reach backend
curl http://localhost:5000/api/health

# 6. Check browser console error (F12 → Console)
# Take screenshot if there are red messages

# 7. Your operating system
uname -a        # Mac/Linux
systeminfo      # Windows
```

### Create GitHub Issue with:
1. **Title**: Clear description of problem
   - ❌ "Blank page"
   - ✓ "Getting blank page after npm run dev:all with API key set"

2. **Description**: The above information

3. **What you've tried**: List what you did

4. **Expected vs Actual**: What should happen vs what does

5. **Screenshots**: Show the problem

---

## 🎯 Checklist (Print & Use)

- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm v8+ installed (`npm --version`)
- [ ] Dependencies installed (`npm install` completed)
- [ ] .env file created (`cp .env.example .env`)
- [ ] .env has MISTRAL_API_KEY (not placeholder)
- [ ] API key is from mistral.ai (not fake)
- [ ] Running both servers (`npm run dev:all`)
- [ ] Both ports show in terminal (5173 and 5000)
- [ ] Opened correct URL (http://localhost:5173, not :5000)
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Browser console shows no red errors (F12)
- [ ] Backend responds to health check (curl test)
- [ ] Can see search page (not blank)
- [ ] Can ask a question and get response
- [ ] Can see answer (yes/no/depends + explanation)

---

## ✅ If Everything Checks Out

**Congratulations!** Your app is working correctly!

- The app needs both servers (frontend + backend)
- Responses take 5-10 seconds (normal for free Mistral)
- Maps/videos may not always appear (depends on Mistral)
- Everything is secure (API key protected)

**Next steps**:
1. Use and test the app
2. Modify for your needs
3. Deploy to production
4. Share with others

---

## 📞 Getting Help

**Still stuck?** 

Before posting on GitHub/Discord:
1. ✅ Complete this entire checklist
2. ✅ Gather all the information above
3. ✅ Include full error messages (copy-paste)
4. ✅ Include terminal output
5. ✅ Include browser console errors
6. ✅ Include screenshot of problem

**Post to**: https://github.com/Alaoh445/is-this-allowed/issues

**Include**: All the information gathered above

---

**Pro Tip**: Most "blank page" issues are solved by running `npm run dev:all` instead of just `npm run dev`!
