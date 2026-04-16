# Mobile & Vercel Connectivity Fix

## What was fixed

### 1. **Localhost Mobile Access**
- ✅ Updated Vite dev server to listen on `0.0.0.0` (all network interfaces)
- ✅ Now accessible from mobile devices on the same WiFi network
- **Access from mobile**: `http://<YOUR_COMPUTER_IP>:5173`

### 2. **Backend for Both Dev & Vercel**
- ✅ API URL detection now properly handles:
  - Localhost development (relative paths via Vite proxy)
  - Mobile clients on same network (relative paths via Vite proxy) 
  - Vercel deployment (serverless functions at `/api/*`)
- ✅ Environment variables properly configured for Vercel

### 3. **Mistral AI Integration**
- ✅ API key fallback included for development
- ✅ Vercel env config updated to load `MISTRAL_API_KEY` from Vercel project settings
- ✅ Server.js uses dotenv for local development

### 4. **YouTube Video Embeds**
- ✅ Fixed invalid embed parameters (`start` and `end` removed as they're not valid in YouTube embeds)
- ✅ Using proper YouTube parameters: `autoplay=1&mute=1&controls=1&modestbranding=1&fs=1`
- ✅ Fallback curated videos display when AI doesn't return valid videos

---

## Setup Instructions

### For Local Development (Desktop & Mobile)

#### Option 1: Run Both Frontend & Backend Together
```bash
npm run dev:all
```
This runs:
- Frontend on `http://localhost:5173` (and accessible from mobile via your IP)
- Backend on `http://localhost:5000`

#### Option 2: Run Separately (More Control)
**Terminal 1 - Frontend:**
```bash
npm run dev
```
Access from desktop: `http://localhost:5173`
Access from mobile: `http://<YOUR_COMPUTER_IP>:5173` (e.g., `http://192.168.1.100:5173`)

**Terminal 2 - Backend:**
```bash
npm run server
```

### For Mobile Testing

**Find Your Computer's IP:**
- **Windows**: Open PowerShell and run `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: Open Terminal and run `ifconfig` (look for inet)

**Access from Mobile:**
- Same WiFi network as your computer
- Navigate to: `http://<YOUR_IP>:5173`
- Example: `http://192.168.1.100:5173`

### Verify Backend Connection

Test if the API is working:
```bash
# From your computer
curl http://localhost:5000/api/health

# From mobile (replace IP)
curl http://192.168.1.100:5000/api/health
```

---

## Environment Variables

### For Local Development (`.env`)
```env
MISTRAL_API_KEY=V2RyZVaQfIZtScgZXizx8VtjUj34wDlB
VITE_API_BASE_URL=
NODE_ENV=development
```

### For Vercel Production
Set these in Vercel Project Settings → Environment Variables:
- `MISTRAL_API_KEY` = Your actual Mistral API key
- `NODE_ENV` = `production`

---

## How It Works

### Development Flow (Localhost + Mobile)
```
Mobile/Desktop Browser
    ↓
http://<IP>:5173 (Vite dev server, listens on 0.0.0.0)
    ↓
Vite Proxy intercepts /api/* requests
    ↓
http://localhost:5000 (Backend Express server)
    ↓
Processes request, calls Mistral AI
    ↓
Returns response to browser
```

### Vercel Production Flow
```
Browser (Vercel domain)
    ↓
https://your-app.vercel.app
    ↓
Relative path /api/answer
    ↓
Vercel routes to /api/answer.js (serverless function)
    ↓
Loads MISTRAL_API_KEY from Vercel env variables
    ↓
Calls Mistral AI API
    ↓
Returns response to browser
```

---

## Troubleshooting

### Mobile Can't Connect
1. ✅ Verify both devices are on **same WiFi**
2. ✅ Check Windows Firewall allows Node.js (you'll get a prompt)
3. ✅ Verify your computer IP: `ipconfig` in PowerShell
4. ✅ Try: `http://<YOUR_IP>:5173` in mobile browser
5. ✅ Check Vite is running on `0.0.0.0:5173` in terminal logs

### Backend Returns 500 Error
1. ✅ Check terminal for error messages
2. ✅ Verify `.env` file has `MISTRAL_API_KEY` set
3. ✅ Ensure backend is running: `npm run server`
4. ✅ Test directly: `curl http://localhost:5000/api/health`

### Mistral AI Not Returning Answers
1. ✅ Confirm API key is valid in `.env`
2. ✅ Check console for Mistral error messages
3. ✅ Verify internet connection is working
4. ✅ Mistral might be rate-limited; wait a bit and retry

### YouTube Videos Show "Content Not Available"
1. ✅ Verify video ID is being extracted correctly (check browser console)
2. ✅ Ensure thumbnail loads (requests go to `img.youtube.com`)
3. ✅ Some videos may have embedding disabled by creator
4. ✅ Use fallback curated videos as backup

---

## Key Files Modified

- **vite.config.js** - Changed dev server to listen on `0.0.0.0`
- **src/utils/api.js** - Improved API URL detection logic
- **api/answer.js** - Better environment variable handling
- **src/pages/Answer.jsx** - Fixed YouTube embed parameters
- **vercel.json** - Updated with proper environment variable config
- **.env.local** - Added MISTRAL_API_KEY for local dev

---

## Next Steps

1. **Test locally with backend:**
   ```bash
   npm run dev:all
   ```
   
2. **Test on mobile (same WiFi):**
   - Find your IP: `ipconfig`
   - Go to `http://<YOUR_IP>:5173`
   - Ask a question and verify AI response works

3. **Deploy to Vercel:**
   - Ensure environment variables are set in Vercel project settings
   - Push to GitHub (Vercel auto-deploys)
   - Test at your Vercel domain

4. **Monitor logs:**
   - Local: Check terminal for error messages
   - Vercel: Check `vercel logs` in CLI or Vercel dashboard

---

## Questions?

Check the error message in:
- **Browser Console** (F12 → Console tab)
- **Terminal** where you ran `npm run dev:all`
- **Vercel Logs** (Dashboard → Deployments → Function Logs)
