# Fix MongoDB Connection - Quick Guide

## Current Issue
Your IP address `122.167.112.177` is not whitelisted in MongoDB Atlas, causing all API calls to return empty data.

## Solution: Whitelist Your IP Address

### Step 1: Go to MongoDB Atlas
1. Visit: https://cloud.mongodb.com/
2. Log in to your account

### Step 2: Navigate to Network Access
1. Click on your project/cluster
2. Go to **Security** → **Network Access** (or **IP Access List**)

### Step 3: Add Your IP Address
1. Click **"Add IP Address"** button
2. You have two options:

   **Option A: Add Your Current IP (Recommended)**
   - Click **"Add Current IP Address"** button (if available)
   - OR manually enter: `122.167.112.177`
   - Click **"Confirm"**

   **Option B: Allow All IPs (Development Only)**
   - Enter: `0.0.0.0/0`
   - Add a comment: "Development - Allow all IPs"
   - Click **"Confirm"**
   - ⚠️ **Warning**: Only use this for development, not production!

### Step 4: Wait for Propagation
- Wait 1-2 minutes for the change to take effect

### Step 5: Verify Connection
Run this command to test:
```bash
node scripts/check-mongodb-connection.js
```

You should see: `✅ Connected successfully!`

## After Whitelisting

Once your IP is whitelisted:
1. The MongoDB connection will work automatically
2. Posts will start loading on the website
3. All API endpoints will return data instead of empty arrays
4. The "No posts available" message will disappear

## Troubleshooting

If connection still fails after whitelisting:

1. **Check your current IP:**
   ```bash
   curl https://api.ipify.org
   ```
   Make sure this matches what you added to MongoDB Atlas

2. **Verify MongoDB Atlas cluster is running:**
   - Go to MongoDB Atlas dashboard
   - Check if your cluster shows as "Running" (not "Paused")

3. **Check connection string:**
   - Verify `MONGODB_URI` in `.env.local` is correct
   - Make sure username and password are correct

4. **Test connection:**
   ```bash
   node scripts/check-mongodb-connection.js
   ```

## Current Status

- ✅ All API endpoints are working (returning empty data gracefully)
- ✅ Application won't crash if database is unavailable
- ❌ Content not loading because MongoDB connection is blocked
- ⏳ Waiting for IP whitelist to be configured

Once you whitelist your IP, everything will work automatically!
