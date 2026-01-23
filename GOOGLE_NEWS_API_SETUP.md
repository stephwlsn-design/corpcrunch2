# Google News API Setup Guide

## How to Get Your News API Key

The implementation uses **NewsAPI.org**, which provides access to news articles from various sources including Google News.

### Step 1: Sign Up for NewsAPI.org

1. Go to **https://newsapi.org/**
2. Click on **"Get API Key"** or **"Sign Up"** button
3. Fill in your details:
   - Email address
   - Password
   - Name
4. Verify your email address (check your inbox)

### Step 2: Get Your API Key

1. After signing up, log in to your account
2. Go to your **Dashboard** (usually at https://newsapi.org/account)
3. You'll see your **API Key** displayed on the dashboard
4. Copy the API key (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 3: Add API Key to Your Project

#### Option A: Create `.env.local` file (Recommended for Development)

1. In your project root (`corpcrunch-main`), create a file named `.env.local`
2. Add your API key:

```bash
GOOGLE_NEWS_API_KEY=your_api_key_here
```

**OR** you can use any of these variable names (the code checks all three):
```bash
GOOGLE_NEWS_API_KEY=your_api_key_here
NEWSAPI_KEY=your_api_key_here
NEWS_API_KEY=your_api_key_here
```

#### Option B: Add to Production Environment Variables

If deploying to **Vercel**, **Netlify**, or another platform:

1. Go to your project settings
2. Find **Environment Variables** section
3. Add a new variable:
   - **Name**: `GOOGLE_NEWS_API_KEY`
   - **Value**: Your API key from NewsAPI.org
4. Save and redeploy

### Step 4: Restart Your Development Server

After adding the API key:

1. Stop your current server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

### API Limits (Free Tier)

- **Free Tier**: 100 requests per day
- **Developer Tier**: $449/month - 250,000 requests/month
- **Business Tier**: Custom pricing

For development and small projects, the free tier is usually sufficient.

---

## Alternative: Using Google News RSS (No API Key Required)

If you prefer not to use NewsAPI.org, you can modify the API to use Google News RSS feeds directly (no API key needed). However, RSS parsing requires additional setup.

---

## Testing Your API Key

Once set up, you can test it by:

1. Opening your homepage
2. The "Recent Stories" section in the hero banner should display news articles
3. If you see an error, check:
   - Your `.env.local` file is in the project root
   - The API key is correct (no extra spaces)
   - You've restarted the server after adding the key
   - Check browser console and server logs for error messages

---

## Troubleshooting

### Error: "News API key not configured"
- Make sure `.env.local` exists in the project root
- Verify the variable name matches: `GOOGLE_NEWS_API_KEY`
- Restart your development server

### Error: "Failed to fetch news from provider"
- Check if your API key is valid
- Verify you haven't exceeded the daily request limit (100 for free tier)
- Check NewsAPI.org dashboard for any account issues

### No news showing up
- Check browser console for errors
- Verify the API endpoint `/api/google-news` is accessible
- Test the API directly: `http://localhost:3001/api/google-news`

