# Visual Guides - How the App Works

## 🏗️ System Architecture

### The Blank Page Problem (What Was Wrong)

```
❌ BEFORE (Blank Page)
═══════════════════════════════════════════════════════════════════

   Browser
      │
      ▼
   index.html ◄── No backend!
      │           No API responses!
      │           No data = BLANK PAGE
      ▼
   (Blank Screen)
```

### The Fixed Version (What Should Happen)

```
✅ AFTER (Working App)
═══════════════════════════════════════════════════════════════════

   Browser (Port 5173)
      │
      │  1. Shows UI
      ▼
   ┌─────────────────┐
   │   Frontend      │
   │  (React/Vite)   │
   │                 │
   │ ┌─────────────┐ │
   │ │ Search Box  │ │
   │ │ State Sel.  │ │
   │ │ Questions   │ │
   │ │ Results     │ │
   │ │ Maps/Video  │ │
   │ └─────────────┘ │
   └────────┬────────┘
            │
            │ 3. fetch("/api/answer")
            │
            ▼
   ┌─────────────────┐
   │  Backend API    │
   │  (Express, 5000)│
   │                 │
   │ 2. POST /answer │
   │ 4. ← Response   │
   └────────┬────────┘
            │
            │ Calls Mistral AI
            │
            ▼
   ┌─────────────────┐
   │  Mistral API    │
   │  (Cloud)        │
   │                 │
   │ Get smart       │
   │ answers using   │
   │ AI              │
   └─────────────────┘
```

## 🔄 Request/Response Flow

```
User Types Question
    │
    ▼
    ┌──────────────────────────────────────────────────────────┐
    │                                                          │
    │   FRONTEND (localhost:5173)                            │
    │   ════════════════════════════════════════════          │
    │                                                          │
    │   1. User enters question "Can I walk freely at night?"  │
    │   2. User selects state "Lagos"                         │
    │   3. User clicks "Ask"                                  │
    │   4. Sends: POST /api/answer                            │
    │      {                                                  │
    │        question: "Can I walk freely...",               │
    │        state: "Lagos"                                  │
    │      }                                                  │
    │                                                          │
    └──────────────────┬───────────────────────────────────────┘
                       │ (Network Request)
                       ▼
    ┌──────────────────────────────────────────────────────────┐
    │                                                          │
    │   BACKEND (localhost:5000)                             │
    │   ══════════════════════════════════════════            │
    │                                                          │
    │   1. Receives: question + state                        │
    │   2. Constructs prompt with state context              │
    │   3. Calls Mistral AI API                              │
    │   4. Receives: comprehensive answer                    │
    │   5. Extracts:                                         │
    │      - Answer (Yes/No/It Depends)                      │
    │      - Explanation                                     │
    │      - Actions                                         │
    │      - Sources                                         │
    │      - Media (images, videos, maps)                    │
    │   6. Returns JSON response                             │
    │                                                          │
    └──────────────────┬───────────────────────────────────────┘
                       │ (JSON Response)
                       ▼
    ┌──────────────────────────────────────────────────────────┐
    │                                                          │
    │   FRONTEND (localhost:5173)                            │
    │   ════════════════════════════════════════════          │
    │                                                          │
    │   1. Receives JSON with answer                         │
    │   2. Displays:                                         │
    │      ✓ "Yes" / "No" / "It Depends"                    │
    │      ✓ Detailed explanation paragraph                 │
    │      ✓ Recommended actions (bulleted list)            │
    │      ✓ Authoritative sources (links)                  │
    │      ✓ Featured image with caption                    │
    │      ✓ Interactive OpenStreetMap                      │
    │      ✓ Embedded YouTube videos                        │
    │   3. User reads answer                                │
    │   4. Can ask another question or navigate             │
    │                                                          │
    └──────────────────────────────────────────────────────────┘
```

## 🚀 Startup Sequence (What Happens When You Run npm run dev:all)

```
$ npm run dev:all
│
├─► "concurrently" starts TWO processes in parallel:
│   │
│   ├─► npm run dev
│   │   │
│   │   ├─ Starting Vite...
│   │   ├─ Building React app...
│   │   ├─ Opening dev server...
│   │   └─ ✓ VITE v7.2.5 ready on http://localhost:5173/
│   │
│   └─► npm run server
│       │
│       ├─ Starting Express...
│       ├─ Connecting to environment variables...
│       ├─ Loading Mistral API key...
│       ├─ Setting up CORS...
│       └─ ✓ Server listening on http://localhost:5000
│
└─► NOW BOTH ARE RUNNING!
    │
    ├─ Frontend ready: http://localhost:5173 ✓
    ├─ Backend ready: http://localhost:5000 ✓
    ├─ API proxy configured: /api → localhost:5000 ✓
    └─ Ready for user interactions ✓

If you only run "npm run dev" (without :all):
├─ Frontend starts ✓
├─ Backend does NOT start ✗
└─ Result: Frontend loads but API calls fail → Blank/No response
```

## 📁 File Organization

```
is-this-allowed/
│
├─ 📄 README.md (you are here!)
├─ 📄 STARTUP_GUIDE.md (setup help)
├─ 📄 BLANK_PAGE_FIX.md (troubleshooting)
├─ 📄 QUICK_REFERENCE.md (cheat sheet)
├─ 📄 DEPLOYMENT_CHECKLIST.md (before launch)
│
├─ 🔐 .env (your secrets - DON'T COMMIT!)
│   ├─ PORT=5000
│   └─ MISTRAL_API_KEY=sk_xxx...
│
├─ 📋 .env.example (template - safe to commit)
│   ├─ PORT=5000
│   └─ MISTRAL_API_KEY=your_key_here
│
├─ ⚙️ package.json
│   ├─ Scripts:
│   │  ├─ npm run dev (frontend only)
│   │  ├─ npm run server (backend only)
│   │  └─ npm run dev:all (both together) ← USE THIS
│   └─ Dependencies: react, express, cors, etc.
│
├─ 🏃 server.js (the backend)
│   ├─ Express app
│   ├─ /api/health endpoint (health check)
│   ├─ /api/answer endpoint (main API)
│   └─ Mistral AI integration
│
├─ ⚡ vite.config.js (frontend build config)
│   └─ Proxy: /api → localhost:5000
│
├─ 📱 index.html (entry point)
│   └─ Loads React app
│
└─ 📂 src/ (React source code)
   ├─ main.jsx (routes)
   │  ├─ / → Home page
   │  ├─ /Answer/:id → Results page
   │  ├─ /contact → Contact page
   │  ├─ /privacy → Privacy policy
   │  └─ /terms → Terms of service
   │
   ├─ App.jsx (main component)
   │
   ├─ pages/
   │  ├─ Home.jsx (search box + state selector)
   │  ├─ Answer.jsx (results + maps + videos)
   │  ├─ Contact.jsx (contact form)
   │  ├─ Privacy.jsx (privacy policy)
   │  └─ Terms.jsx (terms of service)
   │
   └─ components/
      ├─ Header.jsx (top navigation)
      ├─ Footer.jsx (bottom with resources)
      ├─ SearchBox.jsx (search interface)
      ├─ StateSelector.jsx (Nigerian states)
      ├─ AnswerCard.jsx (result display)
      └─ ...other components
```

## 🎯 Common Scenarios & Solutions

### Scenario 1: Blank Page

```
❌ What User Did:
   1. npm install
   2. cp .env.example .env
   3. Opened http://localhost:5173
   4. Got: BLANK PAGE

🔍 Root Cause:
   Backend (port 5000) is NOT running!

✅ Solution:
   Run: npm run dev:all
   (Not just: npm run dev)

Expected Output:
   ✅ VITE v7.2.5 ready on http://localhost:5173/
   ✅ Server running on http://localhost:5000
```

### Scenario 2: API Key Error

```
❌ What User Did:
   1. npm run dev:all
   2. Asked a question
   3. Got error: "Error: API Key not configured"

🔍 Root Cause:
   .env file has no API key or wrong format

✅ Solution:
   1. cat .env (or type .env on Windows)
   2. Check if MISTRAL_API_KEY is there
   3. If not: cp .env.example .env && edit .env
   4. If exists but empty: get key from mistral.ai
   5. Restart: npm run dev:all

Expected .env:
   MISTRAL_API_KEY=sk_xxxxxxxxxxxxxxxx
   (Not: MISTRAL_API_KEY=your_key_here)
```

### Scenario 3: Only Backend Running

```
❌ What User Did:
   Terminal 1: npm run server
   Didn't run: npm run dev

🔍 Symptoms:
   - Port 5000 works (/api/health responds)
   - Port 5173 doesn't exist
   - Can't access UI at all

✅ Solution:
   In another terminal: npm run dev
   OR stop and run: npm run dev:all

This ensures BOTH ports are active.
```

### Scenario 4: Old Cache / Browser Issues

```
❌ What User Did:
   Changed code but browser shows old version
   OR sees error even though backend works

🔍 Root Cause:
   Browser cache or stale connection

✅ Solution:
   Method 1 (Quick):
   - Ctrl+Shift+Delete (clear cache)
   - Ctrl+F5 (hard refresh)

   Method 2 (Full):
   - Close browser completely
   - Stop npm servers (Ctrl+C)
   - npm run dev:all
   - Open http://localhost:5173

   Method 3 (Nuclear):
   - Ctrl+Shift+Delete (clear all time)
   - Ctrl+L in address bar (select URL)
   - Type new URL
   - Enter
```

## 🔌 Port Mapping

```
┌─────────────────────────────────────────┐
│         Your Computer                  │
├─────────────────────────────────────────┤
│                                         │
│  Port 5173          Port 5000           │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │   │
│  │   React/     │  │   Express    │   │
│  │   Vite       │  │   Node.js    │   │
│  └──────────────┘  └──────────────┘   │
│        ▲                    ▲          │
│        │                    │          │
│   HTTP │               API  │          │
│        │              calls │          │
│   localhost:5173      localhost:5000   │
│                                         │
│   What you see         Does the work   │
│   Search box           Calls Mistral   │
│   Results             Returns answers  │
│   Maps                                 │
│                                         │
└─────────────────────────────────────────┘
       │
       │ Internet
       ▼
  ┌──────────────┐
  │ Mistral AI   │
  │ API (Cloud)  │
  └──────────────┘
```

## 🎬 Animation: The Working Flow

```
Step 1: User Opens App
   Browser → http://localhost:5173
   ↓
   Loads React app (from Port 5173)
   ↓
   Shows search page ✓

Step 2: User Asks Question
   "Can I walk at night?"
   ↓
   Selects state "Lagos"
   ↓
   Clicks "Ask"

Step 3: Frontend Makes Request
   fetch('/api/answer', {
     question: 'Can I walk at night?',
     state: 'Lagos'
   })
   ↓
   Sent to localhost:5000 (backend)

Step 4: Backend Processes
   Receives: question + state
   ↓
   Creates prompt with state context
   ↓
   Calls Mistral AI API
   ↓
   Gets AI response
   ↓
   Parses response for:
     - answer
     - explanation
     - actions
     - sources
     - media

Step 5: Backend Responds
   Returns JSON to frontend
   ↓
   {"answer": "Yes", "explanation": "...", ...}

Step 6: Frontend Displays
   Receives JSON
   ↓
   Shows answer: "Yes"
   ↓
   Shows explanation
   ↓
   Shows actions
   ↓
   Shows sources
   ↓
   Shows map of Lagos
   ↓
   Shows relevant images
   ↓
   Shows relevant videos
   ↓
   User reads full answer ✓
```

## 🚦 Status Indicators

### ✅ Everything Works
```
Terminal shows:
✅ VITE v7.2.5 ready in 123 ms
   ➜ Local: http://localhost:5173/

✅ Server running on http://localhost:5000
   📝 API endpoint: http://localhost:5000/api/answer

Browser shows:
✅ Search page with search box
✅ State selector dropdown
✅ Ask button
✅ Can ask questions
✅ Get answers back
✅ See maps, images, videos
```

### ⚠️ Frontend Only (Backend Missing)
```
Terminal shows:
✅ VITE v7.2.5 ready on http://localhost:5173/
❌ (No "Server running" message)

Browser shows:
✅ Search page loads
❌ Questions get no response
❌ Blank/loading state forever
```

### ❌ Both Down
```
Terminal shows:
❌ Nothing is running

Browser shows:
❌ "Cannot reach server"
OR just hangs forever
```

---

**Key Takeaway**: You need BOTH servers running together for the app to work!
