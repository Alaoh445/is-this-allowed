# Testing Guide - Verify Everything Works

## ✅ Quick Verification

### 1. Check Both Servers Are Running
In your terminal, you should see:
```
[0] ➜  Local:   http://localhost:5173/
[1] ✅ Server running on http://localhost:5000
[1] 📚 Using local knowledge base for answers
```

### 2. Test Desktop Version
1. Open browser: **http://localhost:5173**
2. You should see the "Is This Allowed?" home page with header
3. Enter a question: "Can my landlord raise my rent?"
4. Click "Get Answer"
5. Should show comprehensive answer with:
   - Clear Answer (Yes/No/It Depends)
   - Detailed Explanation
   - Recommended Actions (5-6 steps)
   - Source Links (4-5 links)

### 3. Test Different Question Types

#### Test Rent Question
**Question**: "Can my landlord collect 2 years of rent upfront?"
**Expected**: Answer: "It Depends" + Explanation about rent control laws + Actions + Sources

#### Test Eviction Question
**Question**: "Can I be evicted without proper notice?"
**Expected**: Answer: "No" + Details about eviction procedures + Legal protections

#### Test Deposit Question
**Question**: "How long to get my security deposit back?"
**Expected**: Answer: "State-Dependent" + State laws explanation + Actions + Sources

#### Test Generic Question
**Question**: "What are my tenant rights?"
**Expected**: Comprehensive overview + Multiple actions + Legal resources

### 4. Test Mobile Access
**On Same Network (Windows):**
1. Open Command Prompt
2. Type: `ipconfig`
3. Find "IPv4 Address" (e.g., `192.168.1.100`)
4. On mobile phone:
   - Connect to same WiFi
   - Visit: `http://192.168.1.100:5173`
   - Should load the app
   - Ask a question - should work without errors!

## 📋 Expected Behavior

### Correct Functionality
- ✅ Different questions get different answers
- ✅ Answer format is consistent (Answer | Explanation | Actions | Sources)
- ✅ Sources are clickable links
- ✅ Mobile and desktop work the same
- ✅ Answers are relevant to the question asked
- ✅ No "load failed" errors

### Performance
- ✅ Answer loads within 2-3 seconds
- ✅ Page is responsive on both mobile and desktop
- ✅ Button clicks work immediately
- ✅ No console errors in browser DevTools

## 🐛 Troubleshooting Tests

### Test 1: "Load failed" error appears
**Diagnosis:**
- Check terminal: Is backend running? (Look for "✅ Server running on...")
- Check firewall: Does Windows allow port 5000?
- Check CORS: Backend should have `Origin: '*'`

**Fix:**
```bash
# Restart both servers
npm run dev:all
```

### Test 2: Same answer for every question
**Diagnosis:**
- Backend might not be reloaded with new code
- Server process might be outdated

**Fix:**
1. Kill all node processes:
   ```bash
   taskkill /IM node.exe /F
   ```
2. Restart:
   ```bash
   npm run dev:all
   ```

### Test 3: Mobile can't connect
**Diagnosis:**
- Using `localhost` instead of IP address
- Different network
- Firewall blocking port

**Fix:**
- Get correct IP: `ipconfig` 
- Use format: `http://192.168.x.x:5173`
- Check both on same WiFi

### Test 4: Backend errors in terminal
**Diagnosis:**
- Check for syntax errors in `server.js`
- Check if port 5000 is already in use

**Fix:**
- Look at error message in terminal
- Run: `netstat -ano | findstr :5000` to find what's using port
- Kill the process or change PORT in `.env`

## 🧪 Manual API Testing (Advanced)

### Test Backend Directly
1. Open Command Prompt
2. Test the API endpoint:

```bash
curl -X POST http://localhost:5000/api/answer ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"Can my landlord raise my rent?\"}"
```

**Expected Response:**
```json
{
  "question": "Can my landlord raise my rent?",
  "answer": "It Depends",
  "explanation": "Rent increase laws vary...",
  "actions": [...],
  "sources": [...]
}
```

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "Server is running",
  "port": 5000,
  "apiKey": "Using local knowledge base"
}
```

## 📊 Quality Checklist

### Answer Quality
- [ ] Answer directly addresses the question
- [ ] Explanation is 2-3 paragraphs
- [ ] Actions are specific and actionable
- [ ] Sources are real, authoritative, and relevant
- [ ] Disclaimer is shown about legal advice

### User Experience
- [ ] No errors or console warnings
- [ ] Loading spinner appears while fetching
- [ ] Answer displays nicely formatted
- [ ] Mobile layout is responsive
- [ ] Links open in new tabs
- [ ] Back button works

### Mobile Compatibility
- [ ] Works on different screen sizes
- [ ] Touch targets are large enough
- [ ] No horizontal scrolling
- [ ] Links don't require zoom to click
- [ ] Answer text is readable

## 🎯 Sample Questions for Testing

### Easy (Should have specific answers)
1. "Can my landlord evict me without notice?"
2. "Can I be discriminated against in housing?"
3. "What's the law on security deposits?"

### Medium (Should get good contextual answers)
1. "What are my rights as a tenant?"
2. "Can landlord enter my apartment anytime?"
3. "Am I responsible for repairs?"

### Hard (Should get fallback with guidance)
1. "What's the best tenant contract?"
2. "How do I sue my landlord?"
3. "Can I break my lease?"

## ✅ Final Sign-Off

**Everything is working correctly when:**
1. ✅ Both servers show "running" in terminal
2. ✅ Frontend loads at http://localhost:5173
3. ✅ Different questions get different answers
4. ✅ Answers include explanation, actions, and sources
5. ✅ Mobile works at http://192.168.x.x:5173
6. ✅ No "load failed" errors
7. ✅ No console errors in browser

---

**If all checks pass: 🎉 Your app is fully functional!**

Visit http://localhost:5173 and start using it!
