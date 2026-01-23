/**
 * Database Migration Script
 * 
 * This script migrates all data from an old MongoDB database to a new one.
 * It preserves all data including Posts, Categories, and maintains relationships.
 * 
 * Usage:
 *   OLD_MONGODB_URI="mongodb+srv://..." NEW_MONGODB_URI="mongodb+srv://..." node scripts/migrate-database.js
 * 
 * Or set environment variables in .env.local:
 *   OLD_MONGODB_URI=mongodb+srv://old-connection-string
 *   NEW_MONGODB_URI=mongodb+srv://new-connection-string
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Try to load .env.local if dotenv is available
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

// Define schemas inline since models use ES6 modules
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    imageUrl: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    bannerImageUrl: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
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
    allowIndexing: {
      type: Boolean,
      default: true,
    },
    allowFollowing: {
      type: Boolean,
      default: true,
    },
    schemaMarkupType: {
      type: String,
      default: 'Article',
    },
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    secondaryKeywords: [String],
    redirectFrom: String,
    language: {
      type: String,
      default: 'en',
    },
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
    whyThisMattersMultimediaType: {
      type: String,
      enum: ['graphic', 'video'],
    },
    whatsExpectedNext: String,
    whatsExpectedNextMultimediaUrl: String,
    whatsExpectedNextMultimediaType: {
      type: String,
      enum: ['graphic', 'video'],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ slug: 1 });
PostSchema.index({ categoryId: 1 });
PostSchema.index({ publishStatus: 1 });
PostSchema.index({ publishDate: -1 });
PostSchema.index({ createdAt: -1 });

// Configuration
const OLD_MONGODB_URI = process.env.OLD_MONGODB_URI || process.env.MONGODB_URI;
const NEW_MONGODB_URI = process.env.NEW_MONGODB_URI;

if (!OLD_MONGODB_URI) {
  console.error('❌ Error: OLD_MONGODB_URI environment variable is required');
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
  otherCollections: {},
};

/**
 * Connect to a database
 */
async function connectToDatabase(uri, label) {
  try {
    console.log(`\n🔌 Connecting to ${label}...`);
    const connection = await mongoose.createConnection(uri);
    console.log(`✅ Connected to ${label}`);
    return connection;
  } catch (error) {
    console.error(`❌ Failed to connect to ${label}:`, error.message);
    throw error;
  }
}

/**
 * Get all collection names from a database
 */
async function getAllCollections(db) {
  try {
    const collections = await db.db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    console.error('Error listing collections:', error.message);
    return [];
  }
}

/**
 * Migrate Categories
 */
async function migrateCategories(oldDB, newDB) {
  console.log('\n📦 Migrating Categories...');
  
  try {
    // Get old categories
    const OldCategory = oldDB.model('Category', CategorySchema);
    const oldCategories = await OldCategory.find({}).lean();
    stats.categories.exported = oldCategories.length;
    console.log(`   Found ${oldCategories.length} categories in old database`);

    if (oldCategories.length === 0) {
      console.log('   ⚠️  No categories to migrate');
      return;
    }

    // Import to new database
    const NewCategory = newDB.model('Category', CategorySchema);
    
    // Clear existing categories if needed (optional - comment out if you want to keep existing)
    // await NewCategory.deleteMany({});
    
    // Create a map of old _id to new _id for relationship mapping
    const categoryIdMap = new Map();
    
    for (const oldCategory of oldCategories) {
      try {
        // Check if category already exists by slug
        const existing = await NewCategory.findOne({ slug: oldCategory.slug });
        
        if (existing) {
          console.log(`   ⚠️  Category "${oldCategory.name}" already exists, skipping...`);
          categoryIdMap.set(oldCategory._id.toString(), existing._id.toString());
          continue;
        }

        // Create new category (without _id to let MongoDB generate new one)
        const { _id: oldId, ...categoryData } = oldCategory;
        const newCategory = new NewCategory(categoryData);
        await newCategory.save();
        
        categoryIdMap.set(oldId.toString(), newCategory._id.toString());
        stats.categories.imported++;
        console.log(`   ✅ Migrated category: "${oldCategory.name}"`);
      } catch (error) {
        stats.categories.errors++;
        console.error(`   ❌ Error migrating category "${oldCategory.name}":`, error.message);
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
 * Migrate Posts
 */
async function migratePosts(oldDB, newDB, categoryIdMap) {
  console.log('\n📦 Migrating Posts...');
  
  try {
    // Get old posts
    const OldPost = oldDB.model('Post', PostSchema);
    const oldPosts = await OldPost.find({}).lean();
    stats.posts.exported = oldPosts.length;
    console.log(`   Found ${oldPosts.length} posts in old database`);

    if (oldPosts.length === 0) {
      console.log('   ⚠️  No posts to migrate');
      return;
    }

    // Import to new database
    const NewPost = newDB.model('Post', PostSchema);
    
    // Clear existing posts if needed (optional - comment out if you want to keep existing)
    // await NewPost.deleteMany({});
    
    for (const oldPost of oldPosts) {
      try {
        // Check if post already exists by slug
        const existing = await NewPost.findOne({ slug: oldPost.slug });
        
        if (existing) {
          console.log(`   ⚠️  Post "${oldPost.title}" already exists, skipping...`);
          continue;
        }

        // Map categoryId if it exists
        let newCategoryId = oldPost.categoryId;
        if (oldPost.categoryId && categoryIdMap) {
          const oldCategoryId = oldPost.categoryId.toString();
          if (categoryIdMap.has(oldCategoryId)) {
            newCategoryId = categoryIdMap.get(oldCategoryId);
          } else {
            console.log(`   ⚠️  Warning: Category ID ${oldCategoryId} not found in mapping for post "${oldPost.title}"`);
          }
        }

        // Create new post (without _id to let MongoDB generate new one)
        const { _id: oldId, ...postData } = oldPost;
        const newPost = new NewPost({
          ...postData,
          categoryId: newCategoryId,
        });
        await newPost.save();
        
        stats.posts.imported++;
        console.log(`   ✅ Migrated post: "${oldPost.title}"`);
      } catch (error) {
        stats.posts.errors++;
        console.error(`   ❌ Error migrating post "${oldPost.title}":`, error.message);
      }
    }

    console.log(`\n   📊 Posts: ${stats.posts.imported} imported, ${stats.posts.errors} errors`);
  } catch (error) {
    console.error('❌ Error during post migration:', error.message);
    throw error;
  }
}

/**
 * Migrate other collections (if any)
 */
async function migrateOtherCollections(oldDB, newDB) {
  console.log('\n📦 Checking for other collections...');
  
  try {
    const collections = await getAllCollections(oldDB);
    const knownCollections = ['categories', 'posts', 'users'];
    const otherCollections = collections.filter(
      col => !knownCollections.includes(col.toLowerCase())
    );

    if (otherCollections.length === 0) {
      console.log('   ℹ️  No other collections found');
      return;
    }

    console.log(`   Found ${otherCollections.length} other collection(s): ${otherCollections.join(', ')}`);
    
    for (const collectionName of otherCollections) {
      try {
        const collection = oldDB.db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        if (documents.length === 0) {
          console.log(`   ⚠️  Collection "${collectionName}" is empty, skipping...`);
          continue;
        }

        console.log(`   📦 Migrating collection "${collectionName}" (${documents.length} documents)...`);
        
        const newCollection = newDB.db.collection(collectionName);
        
        // Insert documents
        if (documents.length > 0) {
          await newCollection.insertMany(documents, { ordered: false });
          stats.otherCollections[collectionName] = documents.length;
          console.log(`   ✅ Migrated ${documents.length} documents from "${collectionName}"`);
        }
      } catch (error) {
        console.error(`   ❌ Error migrating collection "${collectionName}":`, error.message);
        stats.otherCollections[collectionName] = { error: error.message };
      }
    }
  } catch (error) {
    console.error('❌ Error during other collections migration:', error.message);
  }
}

/**
 * Verify migration
 */
async function verifyMigration(oldDB, newDB) {
  console.log('\n🔍 Verifying migration...');
  
  try {
    const OldCategory = oldDB.model('Category', CategorySchema);
    const NewCategory = newDB.model('Category', CategorySchema);
    const OldPost = oldDB.model('Post', PostSchema);
    const NewPost = newDB.model('Post', PostSchema);

    const oldCategoryCount = await OldCategory.countDocuments({});
    const newCategoryCount = await NewCategory.countDocuments({});
    const oldPostCount = await OldPost.countDocuments({});
    const newPostCount = await NewPost.countDocuments({});

    console.log(`   Categories: Old DB = ${oldCategoryCount}, New DB = ${newCategoryCount}`);
    console.log(`   Posts: Old DB = ${oldPostCount}, New DB = ${newPostCount}`);

    if (oldCategoryCount === newCategoryCount && oldPostCount === newPostCount) {
      console.log('   ✅ Migration verified successfully!');
    } else {
      console.log('   ⚠️  Counts do not match. Please review the migration.');
    }
  } catch (error) {
    console.error('   ❌ Error during verification:', error.message);
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting Database Migration');
  console.log('================================\n');
  console.log('Old Database:', OLD_MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
  console.log('New Database:', NEW_MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

  let oldDB, newDB;

  try {
    // Connect to both databases
    oldDB = await connectToDatabase(OLD_MONGODB_URI, 'Old Database');
    newDB = await connectToDatabase(NEW_MONGODB_URI, 'New Database');

    // Migrate in order (categories first, then posts, then others)
    const categoryIdMap = await migrateCategories(oldDB, newDB);
    await migratePosts(oldDB, newDB, categoryIdMap);
    await migrateOtherCollections(oldDB, newDB);

    // Verify migration
    await verifyMigration(oldDB, newDB);

    // Print summary
    console.log('\n================================');
    console.log('📊 Migration Summary');
    console.log('================================');
    console.log(`Categories: ${stats.categories.imported} imported, ${stats.categories.errors} errors`);
    console.log(`Posts: ${stats.posts.imported} imported, ${stats.posts.errors} errors`);
    
    if (Object.keys(stats.otherCollections).length > 0) {
      console.log('\nOther Collections:');
      for (const [name, count] of Object.entries(stats.otherCollections)) {
        if (typeof count === 'number') {
          console.log(`  ${name}: ${count} documents`);
        } else {
          console.log(`  ${name}: Error - ${count.error}`);
        }
      }
    }

    console.log('\n✅ Migration completed!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (oldDB) {
      await oldDB.close();
      console.log('\n🔌 Closed connection to Old Database');
    }
    if (newDB) {
      await newDB.close();
      console.log('🔌 Closed connection to New Database');
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
