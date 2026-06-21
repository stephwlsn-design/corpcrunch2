/**
 * Backfill SEO metadata for all published posts missing meta fields.
 * Usage: npm run backfill:seo
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

function loadEnvFile(fileName) {
  const envPath = path.join(__dirname, '..', fileName);
  if (!fs.existsSync(envPath)) return;
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

try {
  require('dotenv').config({ path: path.join(__dirname, '..', 'env.local') });
} catch (_) {
  loadEnvFile('env.local');
}

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch (_) {
  loadEnvFile('.env.local');
}

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (_) {
  loadEnvFile('.env');
}

const PRIMARY_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corpcrunch.io';

function generateMetaTitle(title, maxLength = 60) {
  if (!title) return '';
  if (title.length <= maxLength) return title.trim();
  const truncated = title.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

function generateMetaDescription(content, maxLength = 160) {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  const truncated = plainText.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

function calculateReadingTime(content, wordsPerMinute = 200) {
  const words = (content || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

function getCategorySlug(category) {
  if (!category) return '';
  return (
    category.slug?.toLowerCase() ||
    category.name?.toLowerCase().replace(/\s+/g, '-') ||
    ''
  );
}

function buildArticleUrl(post) {
  const category = post.categoryId;
  const categorySlug = getCategorySlug(category);
  const base = PRIMARY_SITE_URL.replace(/\/$/, '');
  if (categorySlug && post.slug) {
    return `${base}/${categorySlug}/blog/${post.slug}`;
  }
  return `${base}/blog/${post.slug}`;
}

function buildPostSeoUpdates(post) {
  const updates = {};

  if (!post.metaTitle?.trim() && post.title?.trim()) {
    updates.metaTitle = generateMetaTitle(post.title.trim());
  }

  if (!post.metaDescription?.trim() && post.content?.trim()) {
    updates.metaDescription = generateMetaDescription(post.content.trim());
  }

  if (!post.excerpt?.trim() && (updates.metaDescription || post.metaDescription)) {
    updates.excerpt = updates.metaDescription || post.metaDescription;
  }

  if (!post.imageAltText?.trim() && post.title?.trim()) {
    updates.imageAltText = post.title.trim();
  }

  if (!post.ogTitle?.trim()) {
    updates.ogTitle = updates.metaTitle || post.metaTitle || generateMetaTitle(post.title || '');
  }

  if (!post.ogDescription?.trim()) {
    updates.ogDescription =
      updates.metaDescription || post.metaDescription || generateMetaDescription(post.content || '');
  }

  if (!post.ogImage?.trim() && post.bannerImageUrl?.trim()) {
    updates.ogImage = post.bannerImageUrl.trim();
  }

  if (!post.readingTime && post.content?.trim()) {
    updates.readingTime = calculateReadingTime(post.content);
  }

  if (post.allowIndexing === undefined || post.allowIndexing === null) {
    updates.allowIndexing = true;
  }

  if (post.allowFollowing === undefined || post.allowFollowing === null) {
    updates.allowFollowing = true;
  }

  if (!post.schemaMarkupType?.trim()) {
    updates.schemaMarkupType = post.contentType === 'video' ? 'NewsArticle' : 'Article';
  }

  if (!post.language?.trim()) {
    updates.language = 'en';
  }

  if (!post.canonicalUrl?.trim() && post.slug && getCategorySlug(post.categoryId)) {
    updates.canonicalUrl = buildArticleUrl(post);
  }

  return updates;
}

const PostSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  },
  { strict: false, collection: 'posts' }
);
const Post = mongoose.models.BackfillPost || mongoose.model('BackfillPost', PostSchema);
const Category =
  mongoose.models.BackfillCategory ||
  mongoose.model(
    'BackfillCategory',
    new mongoose.Schema({}, { strict: false, collection: 'categories' })
  );

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env or env.local');
  }

  await mongoose.connect(uri);
  console.log('Connected to database');

  const posts = await Post.find({
    publishStatus: 'published',
    visibility: 'public',
  }).populate({ path: 'categoryId', model: Category, select: 'name slug' });

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const updates = buildPostSeoUpdates(post);

    if (Object.keys(updates).length === 0) {
      skipped += 1;
      continue;
    }

    await Post.updateOne({ _id: post._id }, { $set: updates });
    updated += 1;
    console.log(`✓ ${post.slug}: ${Object.keys(updates).join(', ')}`);
  }

  console.log('\n--- SEO backfill complete ---');
  console.log(`Total published posts: ${posts.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Already complete: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (error) => {
  console.error('SEO backfill failed:', error.message || error);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
