# Admin Authentication System - Complete Guide

## Current Status

### ❌ **Missing Components:**
1. **Admin Login API Endpoint** - `/api/admin/login` doesn't exist yet
2. **Admin Model** - No Admin schema in MongoDB
3. **JWT Library** - `jsonwebtoken` not installed
4. **Password Hashing** - `bcrypt` not installed
5. **Admin Credentials** - No admin user in database

### ✅ **What Exists:**
1. Frontend login page at `/admin/login`
2. MongoDB connection setup (`lib/mongoose.js`)
3. Axios instance configured (`util/axiosInstance.js`)
4. Token storage in localStorage

---

## How the System Should Work

### 1. **Authentication Flow**

```
User enters credentials
    ↓
Frontend sends POST /api/admin/login
    ↓
Backend validates email/password
    ↓
Backend generates JWT token
    ↓
Frontend stores token in localStorage
    ↓
Token sent in Authorization header for future requests
```

### 2. **JWT Token System**

- **Token Generation**: When admin logs in successfully, backend generates a JWT token
- **Token Storage**: Frontend stores token in `localStorage` as `adminToken` and `token`
- **Token Usage**: Token is automatically added to `Authorization` header via axios interceptor
- **Token Validation**: Backend validates token on protected routes

### 3. **Authorization**

- **Protected Routes**: Admin pages check for `adminToken` in localStorage
- **API Protection**: Backend middleware verifies JWT token on admin API routes
- **Token Expiry**: Tokens can have expiration time (e.g., 24 hours)

---

## Database Setup

### MongoDB Connection

**Connection String Format:**
```
mongodb+srv://stefsoulwlsn_db_user:7QcZFG4VCSvys6ha@<cluster-url>/corpcrunch?retryWrites=true&w=majority
```

**Environment Variable:**
```env
MONGODB_URI=mongodb+srv://stefsoulwlsn_db_user:7QcZFG4VCSvys6ha@cluster0.qkqguav.mongodb.net/corpcrunch?retryWrites=true&w=majority
```

**Database Name:** `corpcrunch`

---

## API Connectivity

### Frontend API Configuration

**File:** `util/axiosInstance.js`

```javascript
baseURL: process.env.NEXT_PUBLIC_API_URL || window.location.origin + "/api"
```

**Environment Variable:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### API Endpoints

**Current:**
- ✅ `/api/posts` - Blog posts
- ✅ `/api/categories` - Categories
- ✅ `/api/health` - Health check
- ❌ `/api/admin/login` - **MISSING - Needs to be created**

**Request Flow:**
1. Frontend calls `axiosInstance.post("/admin/login", { email, password })`
2. Axios adds baseURL: `http://localhost:3001/api/admin/login`
3. Next.js API route handles the request

---

## Implementation Steps

### Step 1: Install Required Dependencies

```bash
npm install jsonwebtoken bcrypt
```

### Step 2: Create Admin Model

**File:** `models/Admin.js`

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
```

### Step 3: Create Admin Login API Route

**File:** `pages/api/admin/login.js`

```javascript
import connectDB from '@/lib/mongoose';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated',
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success with token
    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
```

### Step 4: Create Admin Middleware (for protected routes)

**File:** `lib/adminAuth.js`

```javascript
import jwt from 'jsonwebtoken';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function verifyAdminToken(token) {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return { valid: false, error: 'Admin not found or inactive' };
    }

    return { valid: true, admin };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

export function getAdminFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  return authHeader; // Token is sent as Authorization header
}
```

### Step 5: Create Script to Seed Admin User

**File:** `scripts/create-admin.js`

```javascript
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import connectDB from '../lib/mongoose.js';

async function createAdmin() {
  try {
    await connectDB();
    console.log('Connected to database');

    const adminData = {
      email: 'admin@corpcrunch.io',
      password: 'Admin@123', // Will be hashed automatically
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      console.log('To reset password, delete the admin and run this script again');
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create(adminData);
    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', adminData.password);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
```

**Add to package.json:**
```json
"scripts": {
  "create:admin": "node scripts/create-admin.js"
}
```

### Step 6: Add JWT Secret to Environment

**File:** `.env.local`

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
```

---

## Default Admin Credentials

After running the seed script:

**Email:** `admin@corpcrunch.io`  
**Password:** `Admin@123`

⚠️ **IMPORTANT:** Change the password immediately after first login!

---

## Testing the System

### 1. Install Dependencies
```bash
npm install jsonwebtoken bcrypt
```

### 2. Create Admin User
```bash
npm run create:admin
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test Login
- Go to `http://localhost:3001/admin/login`
- Enter credentials:
  - Email: `admin@corpcrunch.io`
  - Password: `Admin@123`

### 5. Verify Token Storage
- Open browser DevTools → Application → Local Storage
- Check for `adminToken` and `token` keys

---

## Security Best Practices

1. **JWT Secret**: Use a strong, random secret (min 32 characters)
2. **Password Hashing**: Always hash passwords (bcrypt with salt rounds 10)
3. **Token Expiry**: Set reasonable expiration times (24h for admin)
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Never commit secrets to git
6. **Rate Limiting**: Add rate limiting to login endpoint
7. **Password Policy**: Enforce strong passwords

---

## API Request/Response Examples

### Login Request
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@corpcrunch.io",
  "password": "Admin@123"
}
```

### Success Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@corpcrunch.io",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Frontend Token Usage

The token is automatically added to requests via axios interceptor:

```javascript
// util/axiosInstance.js
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});
```

---

## Summary

**Current State:**
- ❌ Admin login API endpoint missing
- ❌ Admin model missing
- ❌ JWT/bcrypt libraries not installed
- ❌ No admin user in database

**What Needs to Be Done:**
1. Install `jsonwebtoken` and `bcrypt`
2. Create Admin model
3. Create `/api/admin/login` endpoint
4. Create admin user seed script
5. Add JWT_SECRET to environment variables
6. Test the login flow

**After Implementation:**
- ✅ Admin can login with email/password
- ✅ JWT token generated and stored
- ✅ Token used for authenticated requests
- ✅ Secure password hashing
- ✅ Token validation on protected routes

