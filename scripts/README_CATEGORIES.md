# Category Management Scripts

This document explains how to add and manage categories in the Corp Crunch CMS.

## Adding New Categories

### Prerequisites
- Node.js installed
- MongoDB connection configured in `.env.local`
- `MONGODB_URI` environment variable set

### Running the Script

To add the new categories to your database, run:

```bash
node scripts/add-new-categories.js
```

### New Categories Being Added

The script will add the following categories to your database:

1. **Retail** - Retail industry news and trends
2. **Sport Tech** - Sports technology and innovation  
3. **Sustainability** - Environmental sustainability and green technology
4. **Telecom** - Telecommunications industry updates
5. **Market Analysis** - Market trends and financial analysis
6. **Digital Retail** - E-commerce and digital retail innovation
7. **FinTech Growth** - Financial technology and growth trends
8. **Cyber Security** - Cybersecurity news and best practices
9. **AI Innovation** - Artificial intelligence and machine learning innovations
10. **Strategic Planning** - Business strategy and planning insights
11. **Cloud Solutions** - Cloud computing and solutions
12. **Data Insights** - Data analytics and insights

### What the Script Does

1. Connects to your MongoDB database
2. Checks if each category already exists (by slug or name)
3. Adds new categories that don't exist
4. Skips categories that already exist
5. Provides a summary of results
6. Lists all active categories in your database

### After Running the Script

Once the categories are added to the database, they will automatically appear in:
- Admin panel category dropdown when creating/editing posts
- Category navigation menus
- Category filter options

### Troubleshooting

**Error: MONGODB_URI not found**
- Make sure your `.env.local` file exists in the project root
- Verify that `MONGODB_URI` is set correctly

**Category already exists**
- This is normal if you've run the script before
- The script will skip existing categories and only add new ones

**Connection timeout**
- Check your MongoDB connection string
- Ensure your IP address is whitelisted in MongoDB Atlas (if using Atlas)
- Verify network connectivity

### Verifying Categories

After running the script, you can verify the categories in:

1. **Admin Panel**: Go to `/admin` and create a new post - you should see all categories in the dropdown
2. **Database**: Use MongoDB Compass or Atlas UI to view the `categories` collection
3. **API**: Visit `/api/categories` to see the JSON response

## Modifying Categories

If you need to add more categories in the future:

1. Edit `scripts/add-new-categories.js`
2. Add new category objects to the `newCategories` array
3. Follow the format:
```javascript
{
  name: 'Category Name',
  slug: 'category-slug',
  description: 'Category description',
  isActive: true,
}
```
4. Run the script again: `node scripts/add-new-categories.js`

## Category Schema

Each category has the following fields:
- `name` (String, required, unique) - Display name
- `slug` (String, required, unique) - URL-friendly identifier
- `description` (String, optional) - Category description
- `imageUrl` (String, optional) - Category image URL
- `isActive` (Boolean, default: true) - Whether category is active

---

**Note**: After adding categories, you may need to restart your Next.js development server to see the changes reflected in the admin panel.

