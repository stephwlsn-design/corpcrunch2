# Adding New Categories to Corp Crunch Admin Panel

## Quick Start

To add the new categories to your database, run one of the following commands:

### Option 1: Using npm script (Recommended)
```bash
npm run add:categories
```

### Option 2: Using node directly
```bash
node scripts/add-new-categories.js
```

## New Categories That Will Be Added

The following categories will be added to your admin panel:

1. ✅ **Retail** - Retail industry news and trends
2. ✅ **Sport Tech** - Sports technology and innovation
3. ✅ **Sustainability** - Environmental sustainability and green technology
4. ✅ **Telecom** - Telecommunications industry updates
5. ✅ **Market Analysis** - Market trends and financial analysis
6. ✅ **Digital Retail** - E-commerce and digital retail innovation
7. ✅ **FinTech Growth** - Financial technology and growth trends
8. ✅ **Cyber Security** - Cybersecurity news and best practices
9. ✅ **AI Innovation** - Artificial intelligence and machine learning innovations
10. ✅ **Strategic Planning** - Business strategy and planning insights
11. ✅ **Cloud Solutions** - Cloud computing and solutions
12. ✅ **Data Insights** - Data analytics and insights

## What Happens When You Run the Script

1. 🔌 Connects to your MongoDB database
2. 🔍 Checks each category to see if it already exists
3. ➕ Adds new categories that don't exist
4. ⏭️ Skips categories that are already in the database
5. 📊 Shows a summary of what was added/skipped
6. 📋 Lists all active categories in your database

## Expected Output

```
🚀 Starting Category Addition
================================

📡 Connecting to MongoDB...
✅ Connected to MongoDB

📦 Adding Categories...

✅ Added category: "Retail" (slug: retail)
✅ Added category: "Sport Tech" (slug: sport-tech)
✅ Added category: "Sustainability" (slug: sustainability)
...

================================
📊 Summary
================================
✅ Added: 12 categories
⚠️  Skipped: 0 categories (already exist)
❌ Errors: 0 categories
📝 Total processed: 12 categories

================================
📋 All Categories in Database
================================
1. AI Innovation (ai-innovation)
2. Cloud Solutions (cloud-solutions)
3. Cyber Security (cyber-security)
...

Total categories in database: 20

✅ Category addition completed!
```

## Verifying the Categories Were Added

### Method 1: Admin Panel
1. Go to your admin page: `http://localhost:3001/admin`
2. Log in with your admin credentials
3. Start creating a new post
4. Look at the **Category** dropdown - you should see all the new categories

### Method 2: API Endpoint
Visit: `http://localhost:3001/api/categories`

You should see a JSON response with all categories including the new ones.

### Method 3: Database
If you have MongoDB Compass or MongoDB Atlas:
1. Open your database
2. Navigate to the `categories` collection
3. You should see all the new categories listed

## Troubleshooting

### ❌ Error: "MONGODB_URI not found"
**Solution**: Make sure your `.env.local` file exists in the project root and contains:
```
MONGODB_URI=your-mongodb-connection-string
```

### ⚠️ Categories already exist
**Solution**: This is normal if you've run the script before. The script safely skips existing categories.

### ❌ Connection timeout or network error
**Solutions**:
- Check your MongoDB connection string in `.env.local`
- If using MongoDB Atlas, ensure your IP address is whitelisted
- Verify your internet connection

### 🔄 Categories don't appear in admin panel
**Solution**: After adding categories, restart your Next.js development server:
```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

## After Adding Categories

Once the categories are in your database:

1. **Admin Panel**: Admins can now select these categories when creating/editing posts
2. **Category Pages**: Each category will have its own page showing posts in that category
3. **Navigation**: Categories will appear in navigation menus (if configured)
4. **Filtering**: Users can filter posts by these categories

## Need Help?

- 📖 See `scripts/README_CATEGORIES.md` for detailed documentation
- 🐛 Check the console output for specific error messages
- 🔍 Use `npm run verify:db` to check your database connection

---

**Ready to add the categories?** Run:
```bash
npm run add:categories
```

