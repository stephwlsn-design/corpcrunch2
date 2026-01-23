/**
 * PostgreSQL to MongoDB Migration Script
 * 
 * This script migrates all data from a PostgreSQL database (Vercel/Postgres)
 * to a MongoDB database, preserving all data and relationships.
 * 
 * Usage:
 *   OLD_POSTGRES_URI="postgres://..." NEW_MONGODB_URI="mongodb+srv://..." node scripts/migrate-postgres-to-mongodb.js
 * 
 * Or set in .env.local:
 *   OLD_POSTGRES_URI=postgres://...
 *   NEW_MONGODB_URI=mongodb+srv://...
 */

const { Client } = require('pg');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Try to load .env.local
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch (e) {
  // dotenv not installed, try to manually parse .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1].trim()]) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
}

// Configuration
const OLD_POSTGRES_URI = process.env.OLD_POSTGRES_URI || process.env.POSTGRES_URI;
const NEW_MONGODB_URI = process.env.NEW_MONGODB_URI || process.env.MONGODB_URI;

if (!OLD_POSTGRES_URI) {
  console.error('❌ Error: OLD_POSTGRES_URI environment variable is required');
  console.error('   Set it in .env.local or as an environment variable');
  process.exit(1);
}

if (!NEW_MONGODB_URI) {
  console.error('❌ Error: NEW_MONGODB_URI environment variable is required');
  console.error('   Set it in .env.local or as an environment variable');
  process.exit(1);
}

// Statistics
const stats = {
  categories: { exported: 0, imported: 0, errors: 0 },
  posts: { exported: 0, imported: 0, errors: 0 },
  otherTables: {},
};

// Define MongoDB schemas
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    imageUrl: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    bannerImageUrl: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    authorFirstName: String,
    authorLastName: String,
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    imageAltText: String,
    publishStatus: {
      type: String,
      enum: ['draft', 'review', 'scheduled', 'published'],
      default: 'published',
    },
    publishDate: Date,
    visibility: {
      type: String,
      enum: ['public', 'private', 'internal', 'members-only'],
      default: 'public',
    },
    excerpt: String,
    readingTime: Number,
    canonicalUrl: String,
    relatedArticles: [String],
    inlineImages: [String],
    attachments: [String],
    inlineImageAltText: String,
    allowIndexing: { type: Boolean, default: true },
    allowFollowing: { type: Boolean, default: true },
    schemaMarkupType: { type: String, default: 'Article' },
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    secondaryKeywords: [String],
    redirectFrom: String,
    language: { type: String, default: 'en' },
    region: String,
    structuredData: String,
    quoteText: String,
    quoteAuthorName: String,
    quoteAuthorTitle: String,
    contentType: {
      type: String,
      enum: ['article', 'video', 'magazine'],
      default: 'article',
    },
    whyThisMatters: String,
    whyThisMattersMultimediaUrl: String,
    whyThisMattersMultimediaType: { type: String, enum: ['graphic', 'video'] },
    whatsExpectedNext: String,
    whatsExpectedNextMultimediaUrl: String,
    whatsExpectedNextMultimediaType: { type: String, enum: ['graphic', 'video'] },
    viewsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.index({ slug: 1 });
PostSchema.index({ categoryId: 1 });
PostSchema.index({ publishStatus: 1 });
PostSchema.index({ publishDate: -1 });
PostSchema.index({ createdAt: -1 });

/**
 * Connect to PostgreSQL
 */
async function connectToPostgres(uri) {
  try {
    console.log('\n🔌 Connecting to PostgreSQL database...');
    
    // Try without SSL first (many servers don't support it)
    let client = new Client({
      connectionString: uri,
      ssl: false
    });
    
    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL');
      return client;
    } catch (noSslError) {
      // If no SSL fails, try with SSL (for Vercel Postgres)
      if (noSslError.message.includes('SSL') || noSslError.message.includes('required')) {
        console.log('   ⚠️  Non-SSL connection failed, trying with SSL...');
        try {
          await client.end();
        } catch (e) {
          // Ignore cleanup errors
        }
        
        client = new Client({
          connectionString: uri,
          ssl: {
            rejectUnauthorized: false
          }
        });
        
        await client.connect();
        console.log('✅ Connected to PostgreSQL (with SSL)');
        return client;
      } else {
        throw noSslError;
      }
    }
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error.message);
    console.error('   Connection string format:', uri.replace(/:[^:@]+@/, ':***@'));
    throw error;
  }
}

/**
 * Connect to MongoDB
 */
async function connectToMongoDB(uri) {
  try {
    console.log('\n🔌 Connecting to MongoDB database...');
    const connection = await mongoose.createConnection(uri);
    console.log('✅ Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Get all table names from PostgreSQL
 */
async function getAllTables(pgClient) {
  try {
    const result = await pgClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('Error listing tables:', error.message);
    return [];
  }
}

/**
 * Migrate Categories from PostgreSQL to MongoDB
 */
async function migrateCategories(pgClient, mongoDB) {
  console.log('\n📦 Migrating Categories...');
  
  try {
    // Try different possible table/column names
    let categories = [];
    let categoryQuery = '';
    
    // Try common table names
    const possibleTableNames = ['categories', 'category', 'Category', 'Categories'];
    let tableName = null;
    
    for (const name of possibleTableNames) {
      try {
        // Use quoted identifier to handle case-sensitive names
        const testResult = await pgClient.query(`SELECT COUNT(*) FROM "${name}"`);
        tableName = name;
        break;
      } catch (e) {
        // Try without quotes (for lowercase)
        try {
          const testResult = await pgClient.query(`SELECT COUNT(*) FROM ${name.toLowerCase()}`);
          tableName = name.toLowerCase();
          break;
        } catch (e2) {
          // Table doesn't exist with this name, try next
          continue;
        }
      }
    }
    
    if (!tableName) {
      console.log('   ⚠️  Categories table not found. Trying to discover schema...');
      const tables = await getAllTables(pgClient);
      console.log('   Available tables:', tables.join(', '));
      
      // Look for table with 'categor' in name (case-insensitive)
      tableName = tables.find(t => t.toLowerCase().includes('categor'));
      if (!tableName) {
        console.log('   ⚠️  No categories table found. Skipping categories migration.');
        return new Map();
      }
    }
    
    console.log(`   Found table: ${tableName}`);
    
    // Get all categories - use quoted identifier for case-sensitive names
    // PostgreSQL requires quotes for mixed-case identifiers
    const quotedTableName = `"${tableName}"`;
    const result = await pgClient.query(`SELECT * FROM ${quotedTableName}`);
    categories = result.rows;
    stats.categories.exported = categories.length;
    console.log(`   Found ${categories.length} categories in PostgreSQL`);

    if (categories.length === 0) {
      console.log('   ⚠️  No categories to migrate');
      return new Map();
    }

    // Import to MongoDB
    const Category = mongoDB.model('Category', CategorySchema);
    const categoryIdMap = new Map();
    
    for (const oldCategory of categories) {
      try {
        // Map PostgreSQL columns to MongoDB schema
        // Handle different possible column names
        const categoryData = {
          name: oldCategory.name || oldCategory.title || oldCategory.category_name,
          slug: oldCategory.slug || oldCategory.slug_name || 
                (oldCategory.name || oldCategory.title || '').toLowerCase().replace(/\s+/g, '-'),
          description: oldCategory.description || oldCategory.desc || null,
          imageUrl: oldCategory.image_url || oldCategory.imageUrl || oldCategory.image || null,
          isActive: oldCategory.is_active !== undefined ? oldCategory.is_active : 
                   (oldCategory.isActive !== undefined ? oldCategory.isActive : true),
        };

        // Ensure required fields
        if (!categoryData.name) {
          console.log(`   ⚠️  Skipping category with no name (ID: ${oldCategory.id || 'unknown'})`);
          continue;
        }

        // Check if category already exists by slug
        const existing = await Category.findOne({ slug: categoryData.slug });
        
        if (existing) {
          console.log(`   ⚠️  Category "${categoryData.name}" already exists, skipping...`);
          categoryIdMap.set(String(oldCategory.id || oldCategory._id), existing._id.toString());
          continue;
        }

        // Create new category
        const newCategory = new Category(categoryData);
        await newCategory.save();
        
        categoryIdMap.set(String(oldCategory.id || oldCategory._id), newCategory._id.toString());
        stats.categories.imported++;
        console.log(`   ✅ Migrated category: "${categoryData.name}"`);
      } catch (error) {
        stats.categories.errors++;
        console.error(`   ❌ Error migrating category:`, error.message);
        console.error(`      Data:`, JSON.stringify(oldCategory, null, 2));
      }
    }

    console.log(`\n   📊 Categories: ${stats.categories.imported} imported, ${stats.categories.errors} errors`);
    return categoryIdMap;
  } catch (error) {
    console.error('❌ Error during category migration:', error.message);
    throw error;
  }
}

/**
 * Migrate Posts from PostgreSQL to MongoDB
 */
async function migratePosts(pgClient, mongoDB, categoryIdMap) {
  console.log('\n📦 Migrating Posts...');
  
  try {
    // Try different possible table names
    const possibleTableNames = ['posts', 'post', 'Post', 'Posts', 'articles', 'article', 'blogs', 'blog'];
    let tableName = null;
    
    for (const name of possibleTableNames) {
      try {
        // Use quoted identifier to handle case-sensitive names
        const testResult = await pgClient.query(`SELECT COUNT(*) FROM "${name}"`);
        tableName = name;
        break;
      } catch (e) {
        // Try without quotes (for lowercase)
        try {
          const testResult = await pgClient.query(`SELECT COUNT(*) FROM ${name.toLowerCase()}`);
          tableName = name.toLowerCase();
          break;
        } catch (e2) {
          continue;
        }
      }
    }
    
    if (!tableName) {
      console.log('   ⚠️  Posts table not found. Trying to discover schema...');
      const tables = await getAllTables(pgClient);
      console.log('   Available tables:', tables.join(', '));
      
      tableName = tables.find(t => 
        t.toLowerCase().includes('post') || 
        t.toLowerCase().includes('article') || 
        t.toLowerCase().includes('blog')
      );
      
      if (!tableName) {
        console.log('   ⚠️  No posts table found. Skipping posts migration.');
        return;
      }
    }
    
    console.log(`   Found table: ${tableName}`);
    
    // Get all posts - use quoted identifier for case-sensitive names
    // PostgreSQL requires quotes for mixed-case identifiers
    const quotedTableName = `"${tableName}"`;
    const result = await pgClient.query(`SELECT * FROM ${quotedTableName}`);
    const posts = result.rows;
    stats.posts.exported = posts.length;
    console.log(`   Found ${posts.length} posts in PostgreSQL`);

    if (posts.length === 0) {
      console.log('   ⚠️  No posts to migrate');
      return;
    }

    // Import to MongoDB
    const Post = mongoDB.model('Post', PostSchema);
    
    for (const oldPost of posts) {
      try {
        // Map PostgreSQL columns to MongoDB schema
        // Handle different possible column names
        const postData = {
          title: oldPost.title || oldPost.headline || oldPost.name,
          slug: oldPost.slug || oldPost.slug_name || 
                (oldPost.title || oldPost.headline || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          content: oldPost.content || oldPost.body || oldPost.text || oldPost.description || '',
          bannerImageUrl: oldPost.banner_image_url || oldPost.bannerImageUrl || 
                         oldPost.image_url || oldPost.imageUrl || oldPost.image || 
                         oldPost.cover_image || '/assets/img/others/notFoundImage.jpg',
          categoryId: null, // Will be set below
          authorFirstName: oldPost.author_first_name || oldPost.authorFirstName || 
                          (oldPost.author_name ? oldPost.author_name.split(' ')[0] : null),
          authorLastName: oldPost.author_last_name || oldPost.authorLastName || 
                         (oldPost.author_name ? oldPost.author_name.split(' ').slice(1).join(' ') : null),
          tags: oldPost.tags ? (Array.isArray(oldPost.tags) ? oldPost.tags : JSON.parse(oldPost.tags)) : [],
          metaTitle: oldPost.meta_title || oldPost.metaTitle,
          metaDescription: oldPost.meta_description || oldPost.metaDescription,
          imageAltText: oldPost.image_alt_text || oldPost.imageAltText,
          publishStatus: oldPost.publish_status || oldPost.publishStatus || 
                        (oldPost.status === 'published' ? 'published' : 'draft') || 'published',
          publishDate: oldPost.publish_date || oldPost.publishDate || oldPost.created_at || oldPost.createdAt,
          visibility: oldPost.visibility || 'public',
          excerpt: oldPost.excerpt || oldPost.summary || oldPost.description,
          readingTime: oldPost.reading_time || oldPost.readingTime,
          canonicalUrl: oldPost.canonical_url || oldPost.canonicalUrl,
          relatedArticles: oldPost.related_articles ? 
                          (Array.isArray(oldPost.related_articles) ? oldPost.related_articles : 
                           JSON.parse(oldPost.related_articles)) : [],
          inlineImages: oldPost.inline_images ? 
                       (Array.isArray(oldPost.inline_images) ? oldPost.inline_images : 
                        JSON.parse(oldPost.inline_images)) : [],
          attachments: oldPost.attachments ? 
                      (Array.isArray(oldPost.attachments) ? oldPost.attachments : 
                       JSON.parse(oldPost.attachments)) : [],
          language: oldPost.language || 'en',
          viewsCount: oldPost.views_count || oldPost.viewsCount || oldPost.views || 0,
          sharesCount: oldPost.shares_count || oldPost.sharesCount || oldPost.shares || 0,
        };

        // Ensure required fields
        if (!postData.title) {
          console.log(`   ⚠️  Skipping post with no title (ID: ${oldPost.id || 'unknown'})`);
          continue;
        }

        if (!postData.content) {
          postData.content = postData.title; // Fallback
        }

        if (!postData.bannerImageUrl || postData.bannerImageUrl === '') {
          postData.bannerImageUrl = '/assets/img/others/notFoundImage.jpg';
        }

        // Map categoryId
        const oldCategoryId = oldPost.category_id || oldPost.categoryId || oldPost.category;
        if (oldCategoryId && categoryIdMap) {
          const categoryIdStr = String(oldCategoryId);
          if (categoryIdMap.has(categoryIdStr)) {
            postData.categoryId = categoryIdMap.get(categoryIdStr);
          } else {
            console.log(`   ⚠️  Warning: Category ID ${categoryIdStr} not found in mapping for post "${postData.title}"`);
            // Try to find category by name or use first available category
            const Category = mongoDB.model('Category', CategorySchema);
            const firstCategory = await Category.findOne({});
            if (firstCategory) {
              postData.categoryId = firstCategory._id;
              console.log(`      Using default category: ${firstCategory.name}`);
            }
          }
        } else if (!postData.categoryId) {
          // No category specified, use first available
          const Category = mongoDB.model('Category', CategorySchema);
          const firstCategory = await Category.findOne({});
          if (firstCategory) {
            postData.categoryId = firstCategory._id;
          } else {
            console.log(`   ⚠️  No categories available for post "${postData.title}"`);
            continue; // Skip posts without categories
          }
        }

        // Check if post already exists by slug
        const existing = await Post.findOne({ slug: postData.slug });
        
        if (existing) {
          console.log(`   ⚠️  Post "${postData.title}" already exists, skipping...`);
          continue;
        }

        // Create new post
        const newPost = new Post(postData);
        await newPost.save();
        
        stats.posts.imported++;
        console.log(`   ✅ Migrated post: "${postData.title}"`);
      } catch (error) {
        stats.posts.errors++;
        console.error(`   ❌ Error migrating post:`, error.message);
        if (error.message.includes('categoryId')) {
          console.error(`      Post data:`, JSON.stringify({
            title: oldPost.title || oldPost.headline,
            categoryId: oldPost.category_id || oldPost.categoryId
          }, null, 2));
        }
      }
    }

    console.log(`\n   📊 Posts: ${stats.posts.imported} imported, ${stats.posts.errors} errors`);
  } catch (error) {
    console.error('❌ Error during post migration:', error.message);
    throw error;
  }
}

/**
 * Migrate other tables
 */
async function migrateOtherTables(pgClient, mongoDB) {
  console.log('\n📦 Checking for other tables...');
  
  try {
    const tables = await getAllTables(pgClient);
    const knownTables = ['categories', 'category', 'posts', 'post', 'articles', 'article', 'blogs', 'blog'];
    const otherTables = tables.filter(
      t => !knownTables.includes(t.toLowerCase())
    );

    if (otherTables.length === 0) {
      console.log('   ℹ️  No other tables found');
      return;
    }

    console.log(`   Found ${otherTables.length} other table(s): ${otherTables.join(', ')}`);
    console.log('   ⚠️  Other tables are not automatically migrated.');
    console.log('   You may need to manually migrate these tables if needed.');
    
    for (const tableName of otherTables) {
      try {
        const result = await pgClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = parseInt(result.rows[0].count);
        stats.otherTables[tableName] = count;
        console.log(`   - ${tableName}: ${count} rows`);
      } catch (error) {
        console.error(`   ❌ Error checking table ${tableName}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error during other tables check:', error.message);
  }
}

/**
 * Verify migration
 */
async function verifyMigration(pgClient, mongoDB) {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Count PostgreSQL data
    let pgCategoryCount = 0;
    let pgPostCount = 0;
    
    try {
      const catResult = await pgClient.query(`
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_name IN ('categories', 'category')
      `);
      if (catResult.rows[0].count > 0) {
        const tables = await getAllTables(pgClient);
        const catTable = tables.find(t => t.toLowerCase().includes('categor'));
        if (catTable) {
          const count = await pgClient.query(`SELECT COUNT(*) FROM ${catTable}`);
          pgCategoryCount = parseInt(count.rows[0].count);
        }
      }
    } catch (e) {
      // Ignore
    }
    
    try {
      const tables = await getAllTables(pgClient);
      const postTable = tables.find(t => 
        t.toLowerCase().includes('post') || 
        t.toLowerCase().includes('article') || 
        t.toLowerCase().includes('blog')
      );
      if (postTable) {
        const count = await pgClient.query(`SELECT COUNT(*) FROM ${postTable}`);
        pgPostCount = parseInt(count.rows[0].count);
      }
    } catch (e) {
      // Ignore
    }

    // Count MongoDB data
    const Category = mongoDB.model('Category', CategorySchema);
    const Post = mongoDB.model('Post', PostSchema);
    
    const mongoCategoryCount = await Category.countDocuments({});
    const mongoPostCount = await Post.countDocuments({});

    console.log(`   PostgreSQL → MongoDB`);
    console.log(`   Categories: ${pgCategoryCount} → ${mongoCategoryCount}`);
    console.log(`   Posts: ${pgPostCount} → ${mongoPostCount}`);

    if (mongoCategoryCount >= stats.categories.imported && mongoPostCount >= stats.posts.imported) {
      console.log('   ✅ Migration verified successfully!');
    } else {
      console.log('   ⚠️  Some data may not have been migrated. Check errors above.');
    }
  } catch (error) {
    console.error('   ❌ Error during verification:', error.message);
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting PostgreSQL to MongoDB Migration');
  console.log('==========================================\n');
  console.log('PostgreSQL:', OLD_POSTGRES_URI.replace(/\/\/.*@/, '//***:***@'));
  console.log('MongoDB:', NEW_MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

  let pgClient, mongoDB;

  try {
    // Connect to both databases
    pgClient = await connectToPostgres(OLD_POSTGRES_URI);
    mongoDB = await connectToMongoDB(NEW_MONGODB_URI);

    // Discover schema
    const tables = await getAllTables(pgClient);
    console.log(`\n📋 Discovered ${tables.length} table(s) in PostgreSQL:`, tables.join(', '));

    // Migrate in order (categories first, then posts, then others)
    const categoryIdMap = await migrateCategories(pgClient, mongoDB);
    await migratePosts(pgClient, mongoDB, categoryIdMap);
    await migrateOtherTables(pgClient, mongoDB);

    // Verify migration
    await verifyMigration(pgClient, mongoDB);

    // Print summary
    console.log('\n================================');
    console.log('📊 Migration Summary');
    console.log('================================');
    console.log(`Categories: ${stats.categories.imported} imported, ${stats.categories.errors} errors`);
    console.log(`Posts: ${stats.posts.imported} imported, ${stats.posts.errors} errors`);
    
    if (Object.keys(stats.otherTables).length > 0) {
      console.log('\nOther Tables:');
      for (const [name, count] of Object.entries(stats.otherTables)) {
        console.log(`  ${name}: ${count} rows (not migrated)`);
      }
    }

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (pgClient) {
      await pgClient.end();
      console.log('\n🔌 Closed connection to PostgreSQL');
    }
    if (mongoDB) {
      await mongoDB.close();
      console.log('🔌 Closed connection to MongoDB');
    }
  }
}

// Run the migration
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
