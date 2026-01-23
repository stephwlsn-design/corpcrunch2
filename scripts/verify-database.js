/**
 * Database Verification Script
 * 
 * This script verifies that the database connection is working
 * and shows what data exists in the database.
 * 
 * Usage: node scripts/verify-database.js
 */

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

// Define schemas
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
    publishStatus: {
      type: String,
      enum: ['draft', 'review', 'scheduled', 'published'],
      default: 'published',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'internal', 'members-only'],
      default: 'public',
    },
    viewsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set');
  console.error('   Please set it in .env.local file');
  process.exit(1);
}

async function verifyDatabase() {
  console.log('🔍 Verifying Database Connection');
  console.log('================================\n');
  console.log('Connection String:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

  let connection;

  try {
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    connection = await mongoose.createConnection(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Get models
    const Category = connection.model('Category', CategorySchema);
    const Post = connection.model('Post', PostSchema);

    // Check Categories
    console.log('📦 Checking Categories...');
    const categoryCount = await Category.countDocuments({});
    console.log(`   Total Categories: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const activeCategories = await Category.countDocuments({ isActive: true });
      console.log(`   Active Categories: ${activeCategories}`);
      
      const categories = await Category.find({}).limit(5).lean();
      console.log('\n   Sample Categories:');
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (slug: ${cat.slug})`);
      });
      if (categoryCount > 5) {
        console.log(`   ... and ${categoryCount - 5} more`);
      }
    } else {
      console.log('   ⚠️  No categories found in database');
    }

    // Check Posts
    console.log('\n📝 Checking Posts...');
    const postCount = await Post.countDocuments({});
    console.log(`   Total Posts: ${postCount}`);
    
    let publishedPosts = 0;
    if (postCount > 0) {
      publishedPosts = await Post.countDocuments({ 
        publishStatus: 'published',
        visibility: 'public'
      });
      console.log(`   Published & Public Posts: ${publishedPosts}`);
      
      const posts = await Post.find({})
        .populate('categoryId', 'name slug')
        .limit(5)
        .lean();
      
      console.log('\n   Sample Posts:');
      posts.forEach((post, index) => {
        const category = post.categoryId ? post.categoryId.name : 'No Category';
        const status = post.publishStatus || 'unknown';
        console.log(`   ${index + 1}. "${post.title}"`);
        console.log(`      Category: ${category}, Status: ${status}, Slug: ${post.slug}`);
      });
      if (postCount > 5) {
        console.log(`   ... and ${postCount - 5} more`);
      }
    } else {
      console.log('   ⚠️  No posts found in database');
      console.log('   💡 You may need to run the migration script');
    }

    // Check for other collections
    console.log('\n📚 Checking for other collections...');
    const collections = await connection.db.listCollections().toArray();
    const knownCollections = ['categories', 'posts'];
    const otherCollections = collections.filter(
      col => !knownCollections.includes(col.name.toLowerCase())
    );
    
    if (otherCollections.length > 0) {
      console.log(`   Found ${otherCollections.length} other collection(s):`);
      for (const col of otherCollections) {
        const count = await connection.db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    } else {
      console.log('   No other collections found');
    }

    // Summary
    console.log('\n================================');
    console.log('📊 Summary');
    console.log('================================');
    console.log(`✅ Database connection: Working`);
    console.log(`📦 Categories: ${categoryCount}`);
    console.log(`📝 Posts: ${postCount}`);
    console.log(`📝 Published & Public Posts: ${publishedPosts}`);
    
    if (postCount === 0) {
      console.log('\n⚠️  WARNING: No posts found in database!');
      console.log('   The application will show "No posts available"');
      console.log('   You need to:');
      console.log('   1. Run the migration script: npm run migrate:db');
      console.log('   2. Or manually add posts through the admin panel');
    } else if (publishedPosts === 0) {
      console.log('\n⚠️  WARNING: No published posts found!');
      console.log('   Posts exist but none are published and public');
      console.log('   Check the publishStatus and visibility fields');
    } else {
      console.log('\n✅ Database looks good! Posts should be visible on the website.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('   → Check your username and password');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   → Check your MongoDB connection string (cluster URL)');
    } else if (error.message.includes('timeout')) {
      console.error('   → Check your network connection and MongoDB Atlas IP whitelist');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

// Run verification
if (require.main === module) {
  verifyDatabase().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { verifyDatabase };
