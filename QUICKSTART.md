# Quick Start Guide

## ✅ Backend & Frontend Setup Complete!

Both servers are now running:

### Frontend
- **URL**: http://localhost:5173
- **Status**: ✅ Running
- **Technology**: React with Vite

### Backend
- **URL**: http://localhost:5000
- **Status**: ✅ Running
- **Technology**: Express.js

## 🚀 How to Use

1. **Open your browser** and go to: http://localhost:5173

2. **Ask any question** about:
   - Tenant rights (rent, eviction, deposits)
   - Housing discrimination
   - Legal regulations
   - Or any other legal question

3. **Get comprehensive answers** with:
   - Clear Yes/No/It Depends answers
   - Detailed explanations
   - Actionable steps
   - Links to authoritative sources

## 📝 Example Questions to Try

- "Can my landlord raise my rent?"
- "Can I be evicted without notice?"
- "Can I be discriminated against in housing?"
- "What are my rights regarding security deposits?"
- "Can my landlord inspect my apartment?"

## 🔧 How It Works

1. **User enters a question** on the home page
2. **Frontend sends request** to the backend API
3. **Backend searches knowledge base** for matching keywords
4. **Backend returns comprehensive answer** with sources
5. **Frontend displays answer** with formatting and links

## 📂 Key Files

- `server.js` - Backend Express server with knowledge base
- `src/pages/Home.jsx` - Question input page
- `src/pages/Answer.jsx` - Answer display page
- `src/components/Header.jsx` - Reusable header component

## ⚙️ API Endpoint

### POST /api/answer
```bash
curl -X POST http://localhost:5000/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"Can my landlord raise my rent?"}'
```

## 🛑 To Stop the Servers

In the terminal where npm is running:
- Press `Ctrl + C` to stop both services

## 📚 To Add More Questions

Edit the `legalKnowledgeBase` in `server.js`:

```javascript
"keyword": {
  answer: "Yes/No/It Depends",
  explanation: "Your explanation here...",
  actions: ["Action 1", "Action 2"],
  sources: [
    { title: "Source Name", url: "https://..." }
  ]
}
```

Then restart the server for changes to take effect.

## 🐛 Troubleshooting

**Q: "Failed to fetch answer" error?**
A: Make sure both frontend and backend are running. Check:
   - Backend running on http://localhost:5000
   - Frontend running on http://localhost:5173

**Q: Port already in use?**
A: Change the port in `.env` or use `npm run dev` and `npm run server` separately with different ports

**Q: CORS error?**
A: The backend has CORS enabled. Ensure frontend and backend can communicate.

## 🎉 You're All Set!

Your "Is This Allowed?" application is fully functional!

Visit: http://localhost:5173 to start using it.
