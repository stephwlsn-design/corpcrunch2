# Quick Start: Fix "No Posts Available" Issue

## The Problem

After migrating from Vercel to MongoDB, your website shows "No posts available" because:
1. The data hasn't been migrated yet, OR
2. The application isn't connecting to the new database correctly

## Quick Fix (5 Steps)

### Step 1: Verify Your Database Connection

Check if your new MongoDB database is accessible:

```bash
npm run verify:db
```

**What to look for:**
- ✅ If it shows posts exist → Go to Step 3
- ❌ If it shows 0 posts → Go to Step 2

### Step 2: Migrate Your Data

If you haven't migrated yet, you need to:

1. **Get your old database connection string**
   - This might be in your Vercel environment variables
   - Or from your old MongoDB Atlas cluster
   - Format:

2. **Add both connection strings to `.env.local`:**


3. **Run the migration:**
   ```bash
   npm run migrate:db
   ```

4. **Verify the migration worked:**
   ```bash
   npm run verify:db
   ```

### Step 3: Check Your Environment Variables

Make sure `.env.local` has:


# API URL (for local development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 4: Restart Your Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test the API

1. **Open your browser and visit:**
   ```
   http://localhost:3001/api/posts
   ```

2. **You should see JSON with posts:**
   ```json
   {
     "success": true,
     "frontPagePosts": [...],
     "trendingPosts": [...]
   }
   ```

3. **If you see this, refresh your website** - posts should now appear!

## Still Not Working?

### Check 1: Are posts published?

Posts need to be published and public. Check with:

```bash
npm run verify:db
```

Look for: `Published & Public Posts: X`

If this is 0, your posts exist but aren't marked as published. You can fix this in MongoDB Atlas or through the admin panel.

### Check 2: Is the API working?

Visit `http://localhost:3001/api/posts` in your browser.

- ✅ **Shows JSON with posts** → API is working, check frontend
- ❌ **Shows error or empty** → Check server terminal for errors

### Check 3: Check Server Logs

Look at the terminal where `npm run dev` is running. Look for:
- Database connection errors
- API route errors
- Any red error messages

## Common Issues

| Issue | Solution |
|-------|----------|
| "MONGODB_URI is not defined" | Add `MONGODB_URI` to `.env.local` |
| "Authentication failed" | Check username/password in connection string |
| "Connection timeout" | Check MongoDB Atlas IP whitelist |
| API returns `{success: true, frontPagePosts: [], trendingPosts: []}` | Posts exist but aren't published/public |
| Browser shows "No posts available" | Check browser console (F12) for errors |

## Need More Help?

See the detailed guides:
- `DATABASE_MIGRATION.md` - Full migration guide
- `TROUBLESHOOTING.md` - Detailed troubleshooting steps

## Summary

1. ✅ Run `npm run verify:db` to check if data exists
2. ✅ If no data, run `npm run migrate:db` to migrate
3. ✅ Set `MONGODB_URI` in `.env.local`
4. ✅ Restart dev server
5. ✅ Test `/api/posts` endpoint
6. ✅ Refresh website

If all steps complete successfully, your posts should appear!
