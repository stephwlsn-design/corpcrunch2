/**
 * Publish All Posts Script
 * 
 * Updates all posts to be published and public so they appear on the website.
 * 
 * Usage: node scripts/publish-all-posts.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Try to load .env.local
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch (e) {
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

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    bannerImageUrl: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
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
  },
  { timestamps: true }
);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function publishAllPosts() {
  console.log('🚀 Publishing All Posts');
  console.log('======================\n');

  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mongoose.createConnection(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    const Post = connection.model('Post', PostSchema);

    // Update all posts to published and public
    const result = await Post.updateMany(
      {},
      {
        $set: {
          publishStatus: 'published',
          visibility: 'public'
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} posts`);
    console.log(`   - Set publishStatus to 'published'`);
    console.log(`   - Set visibility to 'public'`);

    // Verify
    const publishedCount = await Post.countDocuments({
      publishStatus: 'published',
      visibility: 'public'
    });

    console.log(`\n📊 Total published & public posts: ${publishedCount}`);

    if (publishedCount > 0) {
      console.log('\n✅ Success! Posts should now appear on your website.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

if (require.main === module) {
  publishAllPosts().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { publishAllPosts };
