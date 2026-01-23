/**
 * MongoDB Connection Checker
 * 
 * This script checks if your MongoDB connection is working and provides
 * helpful diagnostics if it's not.
 * 
 * Usage: node scripts/check-mongodb-connection.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');

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

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set');
  console.error('   Please set it in .env.local file');
  process.exit(1);
}

// Get current public IP
function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkConnection() {
  console.log('🔍 MongoDB Connection Diagnostic Tool');
  console.log('====================================\n');

  // Get public IP
  console.log('📡 Checking your public IP address...');
  let publicIP;
  try {
    publicIP = await getPublicIP();
    console.log(`   Your public IP: ${publicIP}\n`);
  } catch (error) {
    console.log('   ⚠️  Could not determine public IP\n');
  }

  // Parse connection string (safely)
  const uriMatch = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/);
  if (uriMatch) {
    const [, username, , cluster] = uriMatch;
    console.log('📋 Connection Details:');
    console.log(`   Username: ${username}`);
    console.log(`   Cluster: ${cluster}`);
    console.log(`   Connection String: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}\n`);
  }

  console.log('🔌 Attempting to connect to MongoDB...');
  const startTime = Date.now();

  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000,
    };

    await mongoose.connect(MONGODB_URI, opts);
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Connected successfully! (${connectionTime}ms)\n`);

    // Test with ping
    console.log('🏓 Testing connection with ping...');
    await mongoose.connection.db.admin().ping();
    console.log('✅ Ping successful!\n');

    // Get database info
    const dbName = mongoose.connection.name;
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📊 Database Information:');
    console.log(`   Database: ${dbName}`);
    console.log(`   Collections: ${collections.length}`);
    if (collections.length > 0) {
      console.log('   Collection names:');
      collections.slice(0, 10).forEach(col => {
        console.log(`     - ${col.name}`);
      });
      if (collections.length > 10) {
        console.log(`     ... and ${collections.length - 10} more`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ All checks passed! Your MongoDB connection is working correctly.');
    process.exit(0);

  } catch (error) {
    const connectionTime = Date.now() - startTime;
    console.log(`❌ Connection failed after ${connectionTime}ms\n`);
    console.error('Error:', error.message);
    console.error('\n');

    // Provide helpful error messages
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('🔧 SOLUTION: IP Whitelist Issue');
      console.log('================================\n');
      console.log('Your IP address is not whitelisted in MongoDB Atlas.\n');
      if (publicIP) {
        console.log(`1. Go to MongoDB Atlas: https://cloud.mongodb.com/`);
        console.log(`2. Navigate to: Network Access → IP Access List`);
        console.log(`3. Click "Add IP Address"`);
        console.log(`4. Add this IP: ${publicIP}`);
        console.log(`   OR add: 0.0.0.0/0 (allows all IPs - for development only)\n`);
      } else {
        console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
        console.log('2. Navigate to: Network Access → IP Access List');
        console.log('3. Click "Add IP Address"');
        console.log('4. Add your current IP address');
        console.log('   OR add: 0.0.0.0/0 (allows all IPs - for development only)\n');
      }
    } else if (error.message.includes('authentication')) {
      console.log('🔧 SOLUTION: Authentication Issue');
      console.log('=================================\n');
      console.log('Your MongoDB credentials are incorrect.\n');
      console.log('1. Check your username and password in the connection string');
      console.log('2. Verify the user exists in MongoDB Atlas');
      console.log('3. Check if the user has the correct permissions\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('🔧 SOLUTION: Network/DNS Issue');
      console.log('=============================\n');
      console.log('Cannot resolve MongoDB hostname.\n');
      console.log('1. Check your internet connection');
      console.log('2. Verify the cluster URL in your connection string');
      console.log('3. Check if MongoDB Atlas cluster is running\n');
    } else {
      console.log('🔧 TROUBLESHOOTING:');
      console.log('==================\n');
      console.log('1. Check your MongoDB Atlas cluster status');
      console.log('2. Verify your connection string in .env.local');
      console.log('3. Check MongoDB Atlas Network Access settings');
      console.log('4. Ensure your cluster is not paused\n');
    }

    process.exit(1);
  }
}

checkConnection().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
