# Quick Reference - Command Cheat Sheet

## 🚀 Getting Started (First Time)

```bash
# 1. Clone the repository
git clone https://github.com/Alaoh445/is-this-allowed.git
cd is-this-allowed

# 2. Install dependencies
npm install

# 3. Set up API key (FREE from mistral.ai)
cp .env.example .env
# Edit .env and add your Mistral API key

# 4. Run the app
npm run dev:all

# 5. Open browser
# http://localhost:5173
```

## 📁 Daily Commands

```bash
# Start everything (RECOMMENDED)
npm run dev:all

# Start frontend only (port 5173)
npm run dev

# Start backend only (port 5000)
npm run server

# Test the API
npm run test

# Format code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Troubleshooting Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear cache
npm cache clean --force

# Reinstall everything
rm -rf node_modules package-lock.json
npm install

# Test backend directly
curl http://localhost:5000/api/health

# Test specific API endpoint
curl -X POST http://localhost:5000/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Nigeria?","state":"Lagos"}'
```

## 📝 Configuration Files

| File | Purpose | Edit? |
|------|---------|-------|
| `.env` | API keys & settings | ✏️ YES (copy from .env.example) |
| `.env.example` | Template (no real keys) | ❌ NO (unless adding new vars) |
| `package.json` | Dependencies & scripts | ❌ NO (unless adding packages) |
| `vite.config.js` | Frontend build settings | ❌ NO |
| `server.js` | Backend API server | ✏️ If adding new endpoints |
| `src/main.jsx` | App routes | ✏️ If adding new pages |

## 🌐 URLs

| URL | Purpose | When |
|-----|---------|------|
| http://localhost:5173 | Frontend app | When npm run dev running |
| http://localhost:5000 | Backend API | For testing API directly |
| http://localhost:5000/api/health | API health check | Debugging backend |
| http://localhost:5000/api/answer | Answer endpoint | Testing API |

## 📦 Project Structure

```
is-this-allowed/
├── src/                    # React app
│   ├── main.jsx           # App entry point & routes
│   ├── App.jsx            # Main component
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Search page
│   │   ├── Answer.jsx     # Results page
│   │   ├── Contact.jsx
│   │   ├── Privacy.jsx
│   │   └── Terms.jsx
│   └── components/        # Reusable components
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── ...
├── server.js              # Express backend
├── package.json           # Dependencies
├── vite.config.js         # Frontend build config
├── .env.example           # Template for .env
├── .env                   # Your API keys (DON'T COMMIT)
├── README.md              # Full documentation
├── STARTUP_GUIDE.md       # Setup help
├── BLANK_PAGE_FIX.md      # Troubleshooting
└── .gitignore             # Files to ignore in git
```

## 🔐 Security Checklist

```bash
# Before committing:

# 1. Check .env is NOT tracked
git status
# Should NOT show .env

# 2. Verify .env is ignored
git check-ignore .env
# Should say: .env

# 3. Make sure API keys are safe
cat .env
# Should have real keys

# 4. But .env.example has NO keys
cat .env.example
# Should show: your_mistral_key_here (placeholder)

# 5. Safe to commit
git add .
git commit -m "Your message"
git push
```

## 🚀 Deployment Commands

### To Vercel
```bash
npm run build              # Build first
# Then push to GitHub
git push                   # Vercel auto-deploys

# Configure in Vercel dashboard:
# - Framework: Vite
# - Build: npm run build
# - Output: dist
# - Environment: Add MISTRAL_API_KEY
```

### To Heroku
```bash
heroku login
heroku create your-app-name
heroku config:set MISTRAL_API_KEY="your_key"
git push heroku main
```

### To AWS
```bash
npm run build
# Upload dist/ to S3 or CloudFront
# Deploy server.js separately
```

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` | Dependencies missing | `npm install` |
| `MISTRAL_API_KEY is not defined` | .env not set up | `cp .env.example .env` + add key |
| `Connection refused on 5000` | Backend not running | `npm run server` in separate terminal |
| `Blank page` | Both servers not running | `npm run dev:all` |
| `404 /api/answer` | Backend not responding | Check if `npm run server` is running |
| `CORS error` | Cross-origin issue | Backend CORS is configured, check browser console |

## 📚 Documentation Files

- **README.md** - Full setup & feature docs
- **STARTUP_GUIDE.md** - Step-by-step setup for beginners
- **BLANK_PAGE_FIX.md** - Troubleshooting blank page specifically
- **DEPLOYMENT_CHECKLIST.md** - Pre-launch verification
- **TESTING_GUIDE.md** - How to test the app
- **FIXES_AND_FEATURES.md** - What's been done so far

## 💡 Tips & Tricks

```bash
# Open frontend and backend in split terminals
# Terminal 1:
npm run dev

# Terminal 2:
npm run server

# This way you can see both logs clearly

# Stop servers
# Press Ctrl+C in each terminal

# Keep a browser tab open to:
# http://localhost:5000/api/health
# Refresh it to verify backend is alive
```

## 🎯 Verification Steps

After setup, verify everything works:

```bash
# 1. Check frontend is running
# http://localhost:5173 shows home page ✓

# 2. Check backend is running
curl http://localhost:5000/api/health
# Returns: {"status":"healthy",...} ✓

# 3. Test full flow
# Ask a question on homepage ✓
# Get answer back ✓
# See maps/images/videos ✓

# 4. Check API key is loaded
# terminal should show:
# "Using Mistral AI for intelligent answers" ✓
```

---

**Need more help?** See STARTUP_GUIDE.md or BLANK_PAGE_FIX.md
