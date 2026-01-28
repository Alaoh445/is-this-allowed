# Pre-Deployment Checklist

Use this checklist before pushing to GitHub or deploying to production.

## 🔐 Security & Configuration

- [ ] `.env` file is in `.gitignore` (verify with `git check-ignore .env`)
- [ ] `.env` file is NOT committed (check git history)
- [ ] `.env.example` exists with placeholder values only
- [ ] No API keys visible in any committed files
- [ ] All API keys stored in environment variables, not hardcoded
- [ ] `package.json` has all required dependencies

## ✅ Functionality

- [ ] `npm install` completes without errors
- [ ] `npm run dev:all` starts both frontend and backend
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Backend responds at `http://localhost:5000/api/health`
- [ ] Can submit question and get answer response
- [ ] Images/maps/videos display correctly
- [ ] All pages load (Home, Answer, Contact, Privacy, Terms)
- [ ] Footer links work
- [ ] State selector displays all 36 Nigerian states

## 📦 Build & Production

- [ ] `npm run build` completes without errors
- [ ] `npm run lint` shows no critical errors
- [ ] Build output is in `dist/` folder
- [ ] `npm run preview` shows production build works locally

## 📝 Documentation

- [ ] README.md is updated with setup instructions
- [ ] STARTUP_GUIDE.md has troubleshooting steps
- [ ] .env.example has clear comments
- [ ] Any custom features are documented

## 🐛 Bug Testing

- [ ] Test with empty question input
- [ ] Test with very long question
- [ ] Test with special characters
- [ ] Test all 36 Nigerian states
- [ ] Test Contact form submission
- [ ] Test page navigation with browser back button
- [ ] Test on mobile browser view (Ctrl+Shift+M)

## 🚀 Deployment

### For Vercel (Recommended)

- [ ] GitHub repo is public
- [ ] Vercel is connected to GitHub
- [ ] Environment variables set in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework preset: Vite
- [ ] Node version: 18 or higher

### For Heroku

- [ ] Created Procfile with: `web: npm run dev:all`
- [ ] Added buildpacks: Node.js
- [ ] Set environment variables in dashboard
- [ ] Committed changes to GitHub
- [ ] Run `git push heroku main`

### For AWS/Google Cloud

- [ ] Node.js 18+ available
- [ ] Environment variables configured
- [ ] Both ports 5173 and 5000 exposed
- [ ] CORS properly configured for production domain

## 🔍 Final Review

- [ ] Run through user story from fresh clone:
  1. `git clone repo`
  2. `npm install`
  3. `cp .env.example .env`
  4. Add API key to `.env`
  5. `npm run dev:all`
  6. Open `http://localhost:5173`
  7. Ask a question
  8. Get response
  
- [ ] No console errors (F12 → Console)
- [ ] No warning messages in terminal
- [ ] Performance is acceptable (< 3s load time)

## 📊 Performance Benchmarks

- [ ] Page load time: < 3 seconds
- [ ] API response time: < 5 seconds
- [ ] Image load time: < 2 seconds each
- [ ] Browser memory usage: < 100MB

## 🎯 Launch Readiness

- [ ] All checklist items complete
- [ ] Team review passed
- [ ] Backup of current code
- [ ] Rollback plan in place
- [ ] Monitoring/error tracking set up

---

**Tip**: Save this checklist as a GitHub issue template for team reviews!
