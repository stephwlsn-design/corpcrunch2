# Database Migration Guide

This guide explains how to migrate data from an old MongoDB database to a new one while retaining all data.

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **MongoDB connection strings** for both old and new databases
3. **Access** to both databases

## Setup

### 1. Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 2. Configure Environment Variables

You have two options for providing database connection strings:

#### Option A: Environment Variables (Recommended)

Set the environment variables before running the script:


#### Option B: .env.local File

Add the following to your `.env.local` file in the project root:


**Note:** If you're currently using `MONGODB_URI` in your `.env.local`, the script will use that as the old database URI if `OLD_MONGODB_URI` is not set.

## Running the Migration

### Basic Usage

You can run the migration using npm:

```bash
npm run migrate:db
```

Or directly with node:

```bash
node scripts/migrate-database.js
```

### With Environment Variables

Or:


## What Gets Migrated

The migration script will migrate:

1. **Categories** - All category documents with their relationships
2. **Posts** - All post documents with:
   - All fields and metadata
   - Category relationships (mapped to new category IDs)
   - Timestamps preserved
3. **Other Collections** - Any additional collections found in the old database

## Migration Process

1. **Connection** - Connects to both old and new databases
2. **Categories First** - Migrates categories first to establish ID mappings
3. **Posts** - Migrates posts with updated category references
4. **Other Collections** - Migrates any additional collections
5. **Verification** - Verifies that all data was migrated correctly

## Features

- ✅ **Preserves Relationships** - Category references in posts are automatically updated
- ✅ **Duplicate Prevention** - Skips documents that already exist (by slug for posts/categories)
- ✅ **Error Handling** - Continues migration even if individual documents fail
- ✅ **Progress Logging** - Shows detailed progress for each step
- ✅ **Verification** - Verifies migration success by comparing document counts
- ✅ **Safe** - Does not delete existing data in the new database

## Output

The script provides detailed logging:

```
🚀 Starting Database Migration
================================

🔌 Connecting to Old Database...
✅ Connected to Old Database

📦 Migrating Categories...
   Found 15 categories in old database
   ✅ Migrated category: "Technology"
   ✅ Migrated category: "Business"
   ...

📦 Migrating Posts...
   Found 250 posts in old database
   ✅ Migrated post: "Example Article Title"
   ...

📊 Migration Summary
================================
Categories: 15 imported, 0 errors
Posts: 250 imported, 0 errors

✅ Migration completed!
```

## Verify Database Connection

Before running the migration, verify your new database connection:

```bash
npm run verify:db
```

This will show you:
- If the connection is working
- How many categories and posts exist
- Sample data from your database

## Troubleshooting

### "No posts available" After Migration

If your website shows "No posts available" after migration:

1. **Verify the database has data:**
   ```bash
   npm run verify:db
   ```

2. **Check environment variables:**
   - Make sure `MONGODB_URI` is set in `.env.local`
   - Make sure `NEXT_PUBLIC_API_URL` is set to `/api` or `http://localhost:3001/api` for local development

3. **Check API routes are working:**
   - Visit `http://localhost:3001/api/posts` in your browser
   - You should see JSON data with posts

4. **Verify posts have correct status:**
   - Posts need `publishStatus: 'published'` and `visibility: 'public'` to show
   - Run the verification script to see post statuses

5. **Restart your development server:**
   ```bash
   npm run dev
   ```

### Connection Errors

If you get connection errors:

1. **Check your connection strings** - Ensure they're correctly formatted
2. **Verify network access** - Make sure your IP is whitelisted in MongoDB Atlas
3. **Check credentials** - Verify username and password are correct
4. **Test connection:**
   ```bash
   npm run verify:db
   ```

### Duplicate Key Errors

If you see duplicate key errors:

- The script automatically skips documents that already exist
- If you want to overwrite existing data, you'll need to manually delete it first or modify the script

### Missing Category References

If posts reference categories that don't exist:

- The script will log a warning but continue
- You may need to manually fix these references after migration

### API Not Returning Data

If the API routes return empty data:

1. **Check the API route directly:**
   - Visit `http://localhost:3001/api/posts` in browser
   - Check browser console for errors

2. **Check server logs:**
   - Look for errors in your terminal where `npm run dev` is running

3. **Verify database connection in API:**
   - The API routes use `@/lib/mongoose` to connect
   - Make sure `MONGODB_URI` is set correctly

## Post-Migration Steps

1. **Verify Data** - Check a few posts and categories in the new database
2. **Update Application** - Update your `.env.local` to use `NEW_MONGODB_URI` as `MONGODB_URI`
3. **Test Application** - Run your application and verify everything works
4. **Backup** - Keep a backup of the old database until you're confident everything is working

## Rollback

If you need to rollback:

1. The old database remains unchanged
2. You can re-run the migration if needed
3. Or restore from a backup of the new database

## Notes

- The migration does **not** delete any existing data in the new database
- Documents are identified by their `slug` field to prevent duplicates
- Object IDs are regenerated in the new database (old IDs are not preserved)
- Relationships (like `categoryId` in posts) are automatically mapped to new IDs
- Timestamps (`createdAt`, `updatedAt`) are preserved from the original documents

## Support

If you encounter issues:

1. Check the error messages in the console output
2. Verify your connection strings are correct
3. Ensure both databases are accessible
4. Check MongoDB Atlas logs if using Atlas
