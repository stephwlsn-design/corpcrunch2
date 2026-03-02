/**
 * Reset Admin Password Script
 *
 * Usage:  node scripts/reset-admin-password.js
 *
 * This script resets the password for admin@corpcrunch.io to Admin@123
 * Change NEW_PASSWORD below to whatever password you want.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load .env.local manually (no dotenv dependency required)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1].trim()]) {
            process.env[match[1].trim()] = match[2].trim();
        }
    });
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = 'admin@corpcrunch.io';
const NEW_PASSWORD = 'Admin@123'; // ← change this to your desired password

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env.local');
    process.exit(1);
}

async function resetPassword() {
    let conn;
    try {
        console.log('🔌 Connecting to database...');
        conn = await mongoose.createConnection(MONGODB_URI);
        console.log('✅ Connected!\n');

        const AdminSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true, lowercase: true, trim: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            role: { type: String, default: 'admin' },
            isActive: { type: Boolean, default: true },
        }, { timestamps: true });

        const Admin = conn.model('Admin', AdminSchema);

        const admin = await Admin.findOne({ email: ADMIN_EMAIL });

        if (!admin) {
            console.log(`⚠️  No admin found with email: ${ADMIN_EMAIL}`);
            console.log('   Run  node scripts/create-admin.js  to create one first.');
            process.exit(1);
        }

        console.log(`👤 Found admin: ${admin.email}  (${admin.name})`);
        console.log('🔐 Hashing new password...');

        const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

        await Admin.updateOne({ email: ADMIN_EMAIL }, { $set: { password: hashed } });

        console.log('\n✅ Password reset successfully!');
        console.log('================================');
        console.log('📧 Email:   ', ADMIN_EMAIL);
        console.log('🔑 Password:', NEW_PASSWORD);
        console.log('================================');
        console.log('\n⚠️  Change this password after logging in!');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        if (conn) await conn.close();
        console.log('🔌 Connection closed');
    }
}

resetPassword();
