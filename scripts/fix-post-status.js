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
  publishStatus: String
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function fix() {
  if (!mongoUri) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }
  
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  const result = await Post.updateOne(
    { title: 'Tech Elon Musk’s xAI faces tougher road building out data centers after EPA rule update', publishStatus: 'draft' },
    { $set: { publishStatus: 'published' } }
  );
  
  if (result.modifiedCount > 0) {
    console.log('Successfully published the post!');
  } else {
    console.log('Post not found or already published.');
  }
  
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch(console.error);

