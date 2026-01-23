/**
 * Add New Categories Script
 * 
 * This script adds new categories to the MongoDB database
 * for use in the admin panel when creating posts.
 * 
 * Usage: node scripts/add-new-categories.js
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

// Define Category schema
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

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('   Please set MONGODB_URI in your .env.local file');
  process.exit(1);
}

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// New categories to add
const newCategories = [
  {
    name: 'Retail',
    slug: 'retail',
    description: 'Retail industry news and trends',
    isActive: true,
  },
  {
    name: 'Sport Tech',
    slug: 'sport-tech',
    description: 'Sports technology and innovation',
    isActive: true,
  },
  {
    name: 'Sustainability',
    slug: 'sustainability',
    description: 'Environmental sustainability and green technology',
    isActive: true,
  },
  {
    name: 'Telecom',
    slug: 'telecom',
    description: 'Telecommunications industry updates',
    isActive: true,
  },
  {
    name: 'Market Analysis',
    slug: 'market-analysis',
    description: 'Market trends and financial analysis',
    isActive: true,
  },
  {
    name: 'Digital Retail',
    slug: 'digital-retail',
    description: 'E-commerce and digital retail innovation',
    isActive: true,
  },
  {
    name: 'FinTech Growth',
    slug: 'fintech-growth',
    description: 'Financial technology and growth trends',
    isActive: true,
  },
  {
    name: 'Cyber Security',
    slug: 'cyber-security',
    description: 'Cybersecurity news and best practices',
    isActive: true,
  },
  {
    name: 'AI Innovation',
    slug: 'ai-innovation',
    description: 'Artificial intelligence and machine learning innovations',
    isActive: true,
  },
  {
    name: 'Strategic Planning',
    slug: 'strategic-planning',
    description: 'Business strategy and planning insights',
    isActive: true,
  },
  {
    name: 'Cloud Solutions',
    slug: 'cloud-solutions',
    description: 'Cloud computing and solutions',
    isActive: true,
  },
  {
    name: 'Data Insights',
    slug: 'data-insights',
    description: 'Data analytics and insights',
    isActive: true,
  },
];

async function addCategories() {
  console.log('🚀 Starting Category Addition');
  console.log('================================\n');

  let connection;

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get Category model
    const Category = connection.model('Category', CategorySchema);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    console.log('📦 Adding Categories...\n');

    for (const categoryData of newCategories) {
      try {
        // Check if category already exists by slug or name
        const existing = await Category.findOne({
          $or: [
            { slug: categoryData.slug },
            { name: categoryData.name }
          ]
        });

        if (existing) {
          console.log(`⚠️  Category "${categoryData.name}" already exists (slug: ${existing.slug})`);
          skipped++;
          continue;
        }

        // Create new category
        const newCategory = new Category(categoryData);
        await newCategory.save();
        
        console.log(`✅ Added category: "${categoryData.name}" (slug: ${categoryData.slug})`);
        added++;
      } catch (error) {
        console.error(`❌ Error adding category "${categoryData.name}":`, error.message);
        errors++;
      }
    }

    // Print summary
    console.log('\n================================');
    console.log('📊 Summary');
    console.log('================================');
    console.log(`✅ Added: ${added} categories`);
    console.log(`⚠️  Skipped: ${skipped} categories (already exist)`);
    console.log(`❌ Errors: ${errors} categories`);
    console.log(`📝 Total processed: ${newCategories.length} categories`);

    // List all categories in database
    console.log('\n================================');
    console.log('📋 All Categories in Database');
    console.log('================================');
    const allCategories = await Category.find({ isActive: true }).sort({ name: 1 });
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
    });
    console.log(`\nTotal categories in database: ${allCategories.length}`);

    console.log('\n✅ Category addition completed!');
  } catch (error) {
    console.error('\n❌ Category addition failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (connection) {
      await mongoose.connection.close();
      console.log('\n🔌 Closed connection to MongoDB');
    }
  }
}

// Run the script
if (require.main === module) {
  addCategories()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { addCategories, newCategories };

