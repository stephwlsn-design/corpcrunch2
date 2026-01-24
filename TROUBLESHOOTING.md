# Troubleshooting: "No posts available" After Database Migration

If your website is showing "No posts available" after migrating from Vercel to MongoDB, follow these steps:

## Step 1: Verify Database Connection

First, check if your database connection is working and if data exists:

```bash
npm run verify:db
```

This will show you:
- ✅ If the connection works
- 📦 How many categories exist
- 📝 How many posts exist
- 📝 How many published & public posts exist

**Expected output if everything is working:**
```
✅ Database connection: Working
📦 Categories: 15
📝 Posts: 250
📝 Published & Public Posts: 245
```

## Step 2: Check Environment Variables

Make sure your `.env.local` file has the correct settings:



# API URL (should point to local API for development)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Important:** 
- `MONGODB_URI` must be set for the API routes to work
- `NEXT_PUBLIC_API_URL` should point to your local API during development

## Step 3: Run the Migration (If Not Done Yet)

If the verification shows no posts, you need to migrate the data:

1. **Set both database connection strings in `.env.local`:**
 

2. **Run the migration:**
   ```bash
   npm run migrate:db
   ```

3. **Verify the migration:**
   ```bash
   npm run verify:db
   ```

## Step 4: Test the API Directly

Test if the API routes are working:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the API endpoint in your browser:**
   ```
   http://localhost:3001/api/posts
   ```

   You should see JSON data like:
   ```json
   {
     "success": true,
     "frontPagePosts": [...],
     "trendingPosts": [...]
   }
   ```

3. **If you see an error:**
   - Check the terminal where `npm run dev` is running
   - Look for error messages about database connection
   - Verify `MONGODB_URI` is set correctly

## Step 5: Check Post Status

Posts need specific status to be visible:

- ✅ `publishStatus` must be `'published'`
- ✅ `visibility` must be `'public'`

The verification script will show you how many posts meet these criteria.

If posts exist but aren't published/public, you can update them:

```javascript
// In MongoDB shell or through admin panel
db.posts.updateMany(
  { publishStatus: { $ne: 'published' } },
  { $set: { publishStatus: 'published', visibility: 'public' } }
)
```

## Step 6: Clear Next.js Cache

Sometimes Next.js caches old data. Clear the cache:

```bash
rm -rf .next
npm run dev
```

## Step 7: Check Browser Console

Open your browser's developer console (F12) and check for errors:

- Network errors when fetching `/api/posts`
- JavaScript errors
- CORS errors

## Common Issues and Solutions

### Issue: "MONGODB_URI is not defined"

**Solution:** Make sure `.env.local` exists and has `MONGODB_URI` set.

### Issue: "Authentication failed"

**Solution:** 
- Check your MongoDB username and password
- Make sure special characters in password are URL-encoded
- Verify the user has read/write permissions

### Issue: "Connection timeout"

**Solution:**
- Check your internet connection
- Verify your IP is whitelisted in MongoDB Atlas
- Check MongoDB Atlas status page

### Issue: API returns empty arrays

**Solution:**
- Run `npm run verify:db` to check if data exists
- Check if posts have `publishStatus: 'published'` and `visibility: 'public'`
- Verify the API route query filters match your data

### Issue: "Cannot read property 'frontPagePosts' of undefined"

**Solution:**
- The API might be returning an error
- Check the API endpoint directly: `http://localhost:3001/api/posts`
- Verify the response structure matches what the frontend expects

## Still Having Issues?

1. **Check the migration logs:**
   - Look at the output from `npm run migrate:db`
   - Verify it says "Migration completed successfully"

2. **Check server logs:**
   - Look at terminal output when running `npm run dev`
   - Check for database connection errors

3. **Verify data manually:**
   - Connect to MongoDB Atlas dashboard
   - Check if collections `posts` and `categories` exist
   - Verify documents exist in those collections

4. **Test with a simple query:**
   ```bash
   # In MongoDB shell or Compass
   db.posts.find({ publishStatus: 'published', visibility: 'public' }).count()
   ```

## Quick Checklist

- [ ] `MONGODB_URI` is set in `.env.local`
- [ ] `NEXT_PUBLIC_API_URL` is set to `/api` or `http://localhost:3001/api`
- [ ] Database connection works (`npm run verify:db`)
- [ ] Data exists in database (categories and posts)
- [ ] Posts have `publishStatus: 'published'` and `visibility: 'public'`
- [ ] API endpoint `/api/posts` returns data
- [ ] Development server is running (`npm run dev`)
- [ ] Browser console shows no errors

If all checkboxes are checked and you still see "No posts available", the issue might be in the frontend code. Check the `pages/index.js` file and verify it's correctly handling the API response.
