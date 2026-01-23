const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Try to load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const mongoUri = process.env.MONGODB_URI;

const PostSchema = new mongoose.Schema({
  title: String,
  publishStatus: String,
  categoryId: mongoose.Schema.Types.ObjectId,
  language: String,
  createdAt: Date
});

const CategorySchema = new mongoose.Schema({
  name: String
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function debug() {
  if (!mongoUri) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }
  
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  const categories = await Category.find({});
  console.log('Categories found:', categories.map(c => ({ id: c._id, name: c.name })));
  
  for (const cat of categories) {
    const postCount = await Post.countDocuments({ categoryId: cat._id });
    const publishedCount = await Post.countDocuments({ categoryId: cat._id, publishStatus: 'published' });
    console.log(`Category: ${cat.name} (${cat._id}) - Total Posts: ${postCount}, Published: ${publishedCount}`);
  }
  
  const techCat = categories.find(c => c.name.toLowerCase() === 'technology');
  if (techCat) {
    const recentPosts = await Post.find({ categoryId: techCat._id }).sort({ createdAt: -1 }).limit(10).lean();
    console.log('Recent posts in Technology:', recentPosts.map(p => ({ title: p.title, status: p.publishStatus, lang: p.language, date: p.createdAt })));
  }
  
  await mongoose.disconnect();
  process.exit(0);
}

debug().catch(console.error);
