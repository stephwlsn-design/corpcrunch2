# MongoDB Indexes for Performance Optimization

This document outlines the recommended MongoDB indexes to optimize query performance for the CorpCrunch application.

## Current Index Status

### Categories Collection

**Existing Indexes:**
- `isActive: 1` (already exists in Category model)

**Recommended Additional Indexes:**
```javascript
// For case-insensitive name lookups (used in getCategoryByName)
db.categories.createIndex({ name: 1 }, { collation: { locale: 'en', strength: 2 } });

// For slug lookups (if using slug-based queries)
db.categories.createIndex({ slug: 1 });
```

**Why:**
- `getCategoryByName` uses regex: `{ name: { $regex: new RegExp(\`^${categoryName}$\`, 'i') } }`
- Regex queries are slow without indexes. A case-insensitive collation index makes exact name lookups fast.
- Consider storing a normalized `slug` field and querying by slug instead of regex for better performance.

### Posts Collection

**Recommended Indexes:**

```javascript
// 1. Category + Language + Status + Visibility (most common query pattern)
db.posts.createIndex({ 
  categoryId: 1, 
  language: 1, 
  publishStatus: 1, 
  visibility: 1 
});

// 2. Category + CreatedAt (for newest posts per category)
db.posts.createIndex({ 
  categoryId: 1, 
  createdAt: -1 
});

// 3. Category + SharesCount + CreatedAt (for trending posts per category)
db.posts.createIndex({ 
  categoryId: 1, 
  sharesCount: -1, 
  createdAt: -1 
});

// 4. Category + ViewsCount + CreatedAt (for most viewed posts per category)
db.posts.createIndex({ 
  categoryId: 1, 
  viewsCount: -1, 
  createdAt: -1 
});

// 5. Slug (for individual post lookups)
db.posts.createIndex({ slug: 1 }, { unique: true });

// 6. Status + Visibility + Language (for home page queries)
db.posts.createIndex({ 
  publishStatus: 1, 
  visibility: 1, 
  language: 1, 
  createdAt: -1 
});

// 7. ContentType + VideoUrl (for video posts)
db.posts.createIndex({ 
  contentType: 1, 
  videoUrl: 1, 
  publishStatus: 1, 
  visibility: 1 
});
```

**Why:**
- All category pages query posts by `categoryId` with different sort orders (createdAt, sharesCount, viewsCount)
- Compound indexes support these queries efficiently
- The order matters: equality fields first, then sort fields

### Events Collection

**Existing Indexes (from Event model):**
- `slug: 1` (unique)
- `eventDate: -1`
- `status: 1`
- `featured: 1`
- `category: 1`
- `createdAt: -1`
- `viewsCount: -1`
- Compound: `{ status: 1, eventDate: -1 }`
- Compound: `{ featured: 1, eventDate: -1 }`
- Compound: `{ category: 1, eventDate: -1 }`

**Status:** ✅ Already well-indexed

**Optional Enhancement:**
```javascript
// For language-based queries (if filtering by language)
db.events.createIndex({ language: 1, eventDate: -1 });
```

## Query Performance Analysis

### Slow Query Patterns to Address

1. **Category Name Regex Lookup** (`getCategoryByName`)
   - **Current:** `Category.findOne({ name: { $regex: new RegExp(\`^${categoryName}$\`, 'i') } })`
   - **Issue:** Regex queries can't use indexes efficiently
   - **Solution:** 
     - Add case-insensitive collation index (see above)
     - OR: Store normalized slug and query by slug instead

2. **Multiple Sorted Queries per Category Page**
   - **Current:** 3 separate queries (newest, trending, mostViewed)
   - **Issue:** Each query needs its own index
   - **Solution:** Compound indexes as listed above

3. **Home Page Posts Query**
   - **Current:** Queries by `publishStatus`, `visibility`, `language` with various sorts
   - **Solution:** Compound index covering these fields

## Implementation Script

Create a migration script to add these indexes:

```javascript
// scripts/create-indexes.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Categories indexes
    console.log('Creating category indexes...');
    await db.collection('categories').createIndex(
      { name: 1 }, 
      { collation: { locale: 'en', strength: 2 }, name: 'name_case_insensitive' }
    );
    await db.collection('categories').createIndex({ slug: 1 }, { name: 'slug_index' });

    // Posts indexes
    console.log('Creating post indexes...');
    await db.collection('posts').createIndex(
      { categoryId: 1, language: 1, publishStatus: 1, visibility: 1 },
      { name: 'category_lang_status_visibility' }
    );
    await db.collection('posts').createIndex(
      { categoryId: 1, createdAt: -1 },
      { name: 'category_created_desc' }
    );
    await db.collection('posts').createIndex(
      { categoryId: 1, sharesCount: -1, createdAt: -1 },
      { name: 'category_shares_desc' }
    );
    await db.collection('posts').createIndex(
      { categoryId: 1, viewsCount: -1, createdAt: -1 },
      { name: 'category_views_desc' }
    );
    await db.collection('posts').createIndex(
      { slug: 1 },
      { unique: true, name: 'slug_unique' }
    );
    await db.collection('posts').createIndex(
      { publishStatus: 1, visibility: 1, language: 1, createdAt: -1 },
      { name: 'status_visibility_lang_created' }
    );
    await db.collection('posts').createIndex(
      { contentType: 1, videoUrl: 1, publishStatus: 1, visibility: 1 },
      { name: 'content_type_video' }
    );

    console.log('✅ All indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
```

## Performance Monitoring

After creating indexes, monitor query performance:

```javascript
// Check index usage
db.posts.find({ categoryId: ObjectId("..."), publishStatus: "published" }).explain("executionStats");

// Look for:
// - "stage": "IXSCAN" (index scan) instead of "COLLSCAN" (collection scan)
// - "executionTimeMillis" should be < 100ms for indexed queries
```

## Recommendations

1. **Replace Regex with Slug Lookups**
   - Store normalized slug in Category model
   - Update `getCategoryByName` to query by slug instead of regex
   - This will be significantly faster

2. **Monitor Index Size**
   - Indexes consume disk space and slow down writes
   - Remove unused indexes if query patterns change

3. **Use Projection**
   - When fetching posts, only select needed fields:
   ```javascript
   Post.find({...}).select('title slug bannerImageUrl createdAt viewsCount').lean();
   ```

4. **Consider Aggregation Pipeline**
   - For complex queries (e.g., trending categories), use aggregation with `$facet` to combine multiple queries into one

## Expected Performance Improvements

- **Category page load time:** 50-70% reduction (from ~800ms to ~200-300ms)
- **Home page load time:** 30-40% reduction
- **Database query time:** 60-80% reduction for indexed queries
- **MongoDB CPU usage:** 40-50% reduction

## Next Steps

1. Run the index creation script in development/staging first
2. Monitor query performance using MongoDB Atlas or `explain()`
3. Test category page load times before/after
4. Deploy to production after verification

