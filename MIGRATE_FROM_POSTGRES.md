# Migrate from PostgreSQL (Vercel) to MongoDB

## Quick Start

### Step 1: Update Your `.env.local` File

Add these connection strings to your `.env.local` file:



### Step 2: Run the Migration

```bash
npm run migrate:postgres
```

This will:
- ✅ Connect to your PostgreSQL database
- ✅ Discover all tables automatically
- ✅ Migrate all categories
- ✅ Migrate all posts with relationships
- ✅ Preserve all data and timestamps

### Step 3: Verify the Migration

```bash
npm run verify:db
```

You should now see your posts and categories!

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

Visit `http://localhost:3001` - your posts should now appear! 🎉

## What Gets Migrated

- ✅ **Categories** - All category data with relationships
- ✅ **Posts** - All posts with:
  - All content and metadata
  - Category relationships (automatically mapped)
  - Author information
  - Tags, images, and attachments
  - View and share counts
  - Timestamps (created_at, updated_at)

## How It Works

The script automatically:
1. **Discovers your PostgreSQL schema** - Finds tables named `categories`, `posts`, `articles`, etc.
2. **Maps columns** - Handles different column naming conventions (snake_case, camelCase)
3. **Transforms data** - Converts PostgreSQL data types to MongoDB format
4. **Preserves relationships** - Maps category IDs from PostgreSQL to MongoDB
5. **Handles duplicates** - Skips data that already exists

## Troubleshooting

### "Connection refused" or "Connection timeout"

- Check your PostgreSQL connection string
- Verify the database is accessible from your IP
- For Vercel Postgres, make sure the connection string is correct

### "Authentication failed" for MongoDB

- Check your MongoDB password
- Make sure special characters are URL-encoded
- Verify the username is correct: `stefsoulwlsn_db_user`

### "Table not found"

The script will show you all available tables. If your tables have different names, the script will try to find them automatically. If it can't find them, you may need to modify the script.

### Posts migrated but not showing on website

1. Check if posts have `publishStatus: 'published'` and `visibility: 'public'`
2. Run `npm run verify:db` to check post statuses
3. Restart your dev server: `npm run dev`

## Schema Mapping

The script handles common PostgreSQL to MongoDB mappings:

| PostgreSQL | MongoDB |
|------------|---------|
| `id` | `_id` (auto-generated) |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `category_id` | `categoryId` (ObjectId reference) |
| `banner_image_url` | `bannerImageUrl` |
| `publish_status` | `publishStatus` |
| `views_count` | `viewsCount` |

## Next Steps

After migration:
1. ✅ Verify data with `npm run verify:db`
2. ✅ Test your website
3. ✅ Update Vercel environment variables (if deploying)
4. ✅ Keep PostgreSQL backup until you're confident everything works

## Need Help?

- Check the migration output for specific errors
- Run `npm run verify:db` to see what data exists
- Check server logs when running `npm run dev`
