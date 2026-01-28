# Is This Allowed? - Nigerian Legal & Knowledge Assistant

A modern web application that provides comprehensive answers to any question - legal matters, general knowledge, geography, history, and more. Powered by Mistral AI and tailored for Nigerian jurisdictions.

## Features

✨ **Comprehensive Answers** - Get detailed responses on any topic with explanations and recommended actions
🗺️ **Interactive Maps** - View location-based information with embedded OpenStreetMap
📸 **Rich Media** - Images, videos, and other multimedia to illustrate answers
📍 **State-Specific** - Select your Nigerian state to get jurisdiction-specific legal information
🎨 **Modern UI** - Clean, sleek interface inspired by Wikipedia and Google

## Quick Start (Important!)

### Prerequisites
- **Node.js v16+** - [Download](https://nodejs.org/)
- **Mistral AI Key** (FREE) - [Get here](https://console.mistral.ai/)

### Setup in 3 Steps

**Step 1: Clone & Install**
```bash
git clone https://github.com/Alaoh445/is-this-allowed.git
cd is-this-allowed
npm install
```

**Step 2: Configure API Key**
```bash
cp .env.example .env
```
Edit `.env` and add your Mistral API key:
```
MISTRAL_API_KEY=your_key_here
```

**Step 3: Run the App**
```bash
npm run dev:all
```

✅ Open browser to `http://localhost:5173`

## Commands

```bash
npm run dev          # Frontend only (port 5173)
npm run server       # Backend only (port 5000)
npm run dev:all      # Both frontend & backend (RECOMMENDED)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
```

## Project Structure

```
src/
├── pages/           # Page components
│   ├── Home.jsx     # Main search page
│   ├── Answer.jsx   # Results page with maps/images/videos
│   ├── Contact.jsx  # Contact form
│   ├── Privacy.jsx  # Privacy policy
│   └── Terms.jsx    # Terms of service
├── components/      # Reusable components
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── ...
└── main.jsx         # App entry point

server.js           # Express backend API
package.json        # Dependencies & scripts
.env.example        # Environment template (copy to .env)
```

## How It Works

1. **User asks a question** on the home page
2. **Selects their Nigerian state** for jurisdiction-specific answers
3. **Backend sends query to Mistral AI** via `/api/answer` endpoint
4. **Response includes**:
   - Answer (Yes/No/It Depends)
   - Detailed explanation
   - Recommended actions
   - Authoritative sources
   - Maps, images, videos (when relevant)
5. **Frontend displays results** with rich media

## Troubleshooting Blank Page

**Issue**: App shows blank page

**Solution 1: Check both servers are running**
```bash
npm run dev:all
# You should see:
# - Vite dev server on http://localhost:5173
# - Express server listening on port 5000
```

**Solution 2: Clear cache & reload**
- Press `Ctrl+Shift+Delete` (clear cache)
- Press `Ctrl+F5` (hard refresh)
- Check browser console (F12) for errors

**Solution 3: Check backend is responding**
```bash
# In another terminal, test the API:
curl -X POST http://localhost:5000/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Nigeria?","state":"Lagos"}'
```

**Solution 4: Verify .env file**
```bash
# Make sure .env exists in root directory:
ls -la .env  # Linux/Mac
dir .env    # Windows

# Should contain:
cat .env
# PORT=5000
# MISTRAL_API_KEY=your_key_here
```

## API Reference

### POST `/api/answer`

**Request:**
```json
{
  "question": "Can my landlord collect 2 years rent?",
  "state": "Lagos"
}
```

**Response:**
```json
{
  "answer": "No",
  "explanation": "In Lagos State...",
  "actions": ["Step 1", "Step 2", ...],
  "sources": [{"title": "Name", "url": "https://..."}],
  "media": {
    "image_url": "https://...",
    "video_urls": ["https://..."],
    "map_data": {"latitude": 6.5244, "longitude": 3.3792}
  }
}
```

## Environment Variables

Create `.env` file:
```
PORT=5000                          # Backend port
NODE_ENV=development               # dev or production
MISTRAL_API_KEY=sk-xxx...         # Required - Get from mistral.ai
GROQ_API_KEY=                     # Optional
OPENAI_API_KEY=                   # Optional
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

## Security Notes

⚠️ **IMPORTANT**:
- **Never commit `.env` file**
- Always use `.env.example` as template
- Rotate API keys regularly
- Keep `.gitignore` updated

## Tech Stack

- React 19
- React Router 7
- Vite (build tool)
- Express.js (backend)
- Mistral AI (AI responses)
- OpenStreetMap (maps)

## Contributing

1. Fork repo
2. Create feature branch
3. Commit changes
4. Push & create PR

## License

MIT

## Support

- 🐛 Found a bug? [Open issue](https://github.com/Alaoh445/is-this-allowed/issues)
- 📧 Email: support@isthisallowed.com
- 💬 Questions? Check [Discussions](https://github.com/Alaoh445/is-this-allowed/discussions)

---

**Made with ❤️ by Alaoh** | Powered by Mistral AI
