/**
 * Create Admin User Script
 * 
 * This script creates a default admin user in the database
 * 
 * Usage: npm run create:admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

// Admin Schema
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set');
  console.error('   Please set it in .env.local file');
  process.exit(1);
}

async function createAdmin() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mongoose.createConnection(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    const Admin = connection.model('Admin', AdminSchema);

    // Default admin credentials
    const adminData = {
      email: 'admin@corpcrunch.io',
      password: 'Admin@123',
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      console.log('\n💡 To reset the password:');
      console.log('   1. Delete the admin from database, or');
      console.log('   2. Update the password manually in MongoDB');
      process.exit(0);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin
    console.log('👤 Creating admin user...');
    const admin = await Admin.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log('\n✅ Admin created successfully!');
    console.log('================================');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Name:', admin.name);
    console.log('🎭 Role:', admin.role);
    console.log('================================');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Change the password after first login!');
    console.log('   - Keep these credentials secure!');
    console.log('   - Do not commit credentials to version control!');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   → Admin with this email already exists');
    } else if (error.message.includes('authentication failed')) {
      console.error('   → Check your MongoDB username and password');
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

// Run script
if (require.main === module) {
  createAdmin().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { createAdmin };

