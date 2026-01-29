# Netlify Environment Variables Setup Guide

## Problem
Your Netlify site isn't using AI APIs because environment variables are **not set in Netlify dashboard**. The .env file on your local machine is only for local development.

## Solution: Add Environment Variables to Netlify

### Step 1: Get Your API Keys

**Mistral AI (FREE - Recommended)**
1. Go to https://console.mistral.ai/
2. Sign up/Log in
3. Create an API key
4. Copy the key

**Groq (Optional FREE alternative)**
1. Go to https://console.groq.com/keys
2. Sign up/Log in
3. Create an API key
4. Copy the key

**OpenAI (Optional - Requires paid account)**
1. Go to https://platform.openai.com/api/keys
2. Create an API key
3. Copy the key

### Step 2: Add Keys to Netlify Dashboard

**Follow these exact steps:**

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (is-this-allowed)
3. Go to **Settings** (in the top menu)
4. Click **Environment** in the left sidebar
5. Click **Add a variable** or **Edit variables**
6. Add the following environment variables:

```
Key: MISTRAL_API_KEY
Value: [Your Mistral API key from step 1]
```

```
Key: GROQ_API_KEY
Value: [Your Groq API key - optional]
```

```
Key: OPENAI_API_KEY
Value: [Your OpenAI API key - optional]
```

7. **Important:** After adding/modifying environment variables, **rebuild your site**:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**
   - Wait for deployment to complete (green checkmark)

### Step 3: Verify It's Working

1. Go to your Netlify site
2. Ask a question like "Eviction in Nigeria"
3. You should see a comprehensive AI-generated answer
4. Check your browser console (F12 > Console) for logs showing which API is being used

## How It Works Now

The updated serverless function (`netlify/functions/answer.js`) will:

1. **Check for MISTRAL_API_KEY** → Use Mistral API
2. **If no Mistral, check for GROQ_API_KEY** → Use Groq API  
3. **If no Groq, check for OPENAI_API_KEY** → Use OpenAI API
4. **If no API key**, try to call backend server at `REACT_APP_BACKEND_URL` environment variable
5. **If all fail**, use comprehensive template answers (as fallback)

## Troubleshooting

### Issue: Still getting template answers after setting env vars

**Solution:**
1. Make sure you **triggered a rebuild** in Netlify after adding env vars
2. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Open site in a new incognito/private window
4. Wait 2-3 minutes for Netlify to fully redeploy

### Issue: Getting errors in the browser console

**Solution:**
1. Press F12 to open Developer Tools
2. Click **Console** tab
3. Look for error messages starting with `[Handler]`, `[getMistralAnswer]`, etc.
4. Common errors:
   - **401 Unauthorized** → API key is invalid or expired
   - **429 Too Many Requests** → Rate limit hit (free tier limit)
   - **Timeout** → API taking too long (serverless timeout is 25 seconds)

### Issue: Getting different answers on localhost vs Netlify

**Solution:**
This is actually OK if:
- Localhost uses one AI model
- Netlify uses another AI model (due to different API keys)

Both are AI-powered, just different models.

To sync them:
- Set the **same API key** on both localhost (in .env) and Netlify (in dashboard)
- Both will then use the same AI model

## Environment Variables Reference

| Variable | Required | Where to get |
|----------|----------|--------------|
| `MISTRAL_API_KEY` | No (free tier) | https://console.mistral.ai/ |
| `GROQ_API_KEY` | No (free tier) | https://console.groq.com/keys |
| `OPENAI_API_KEY` | No (costs $) | https://platform.openai.com/api/keys |
| `REACT_APP_BACKEND_URL` | No | Your backend server URL (if running) |

## Current Architecture

```
User visits Netlify site
         ↓
React app asks question
         ↓
Answer page calls /.netlify/functions/answer
         ↓
Serverless function checks env variables
         ↓
Tries: Mistral → Groq → OpenAI → Backend Server → Template Answers
         ↓
Returns AI answer or template answer
         ↓
User sees comprehensive response
```

## What Changed

The serverless function now includes:
- ✅ Better error logging for debugging
- ✅ Timeout protection (25 seconds)
- ✅ JSON parsing improvements  
- ✅ Fallback chain (multiple AI APIs)
- ✅ Comprehensive template answers as final fallback
- ✅ Support for backend server integration

## Still Not Working?

1. Check Netlify deploy logs:
   - Go to **Deploys** → Click the latest deploy → Scroll to "Deploy log"
   - Look for errors during build

2. Check Netlify function logs:
   - Go to **Functions** → Click on the function (if available)
   - Check for runtime errors

3. Test the API directly:
   - Open your browser console (F12)
   - In the console, run:
   ```javascript
   fetch('/.netlify/functions/answer', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({question: 'Eviction in Nigeria', state: 'Nigeria'})
   }).then(r => r.json()).then(console.log).catch(console.error)
   ```
   - This shows the actual response from the serverless function

## Support

If you're still having issues:
1. Check the console logs (F12 > Console)
2. Verify API keys are correct and not expired
3. Make sure you triggered a rebuild after adding env vars
4. Check that your API key tier has quota remaining
