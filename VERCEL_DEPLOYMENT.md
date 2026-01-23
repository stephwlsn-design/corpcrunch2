# Vercel Deployment Guide

This guide will help you deploy the CorpCrunch project to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A MongoDB database (MongoDB Atlas recommended)
3. Your project repository on GitHub, GitLab, or Bitbucket

## Step 1: Prepare Your Repository

Ensure your code is pushed to a Git repository:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js and configure settings
5. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

After your first deployment, configure environment variables in Vercel:

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Optional Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
GOOGLE_NEWS_API_KEY=your-news-api-key-here
NEWSAPI_KEY=your-news-api-key-here
NEWS_API_KEY=your-news-api-key-here
```

### How to Add Environment Variables in Vercel:

1. In your project settings, go to **Environment Variables**
2. Click **"Add New"**
3. Enter the **Name** and **Value**
4. Select environments: **Production**, **Preview**, and/or **Development**
5. Click **"Save"**
6. **Redeploy** your application for changes to take effect

## Step 4: MongoDB Setup

### Using MongoDB Atlas (Recommended)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses (or use `0.0.0.0/0` for Vercel)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
6. Add it as `MONGODB_URI` in Vercel environment variables

### Network Access for Vercel

In MongoDB Atlas:
- Go to **Network Access**
- Click **"Add IP Address"**
- Click **"Allow Access from Anywhere"** (or add Vercel's IP ranges)

## Step 5: Verify Deployment

After deployment:

1. Visit your Vercel deployment URL
2. Check that pages load correctly
3. Test API endpoints (e.g., `/api/categories`)
4. Verify database connection
5. Test admin authentication (if applicable)

## Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

## Troubleshooting

### Build Fails

**Issue**: Build errors during deployment
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18.x by default)

### Database Connection Errors

**Issue**: `MONGODB_URI` not found or connection fails
**Solution**:
- Verify environment variable is set in Vercel
- Check MongoDB Atlas network access settings
- Ensure connection string is correct
- Redeploy after adding environment variables

### API Routes Not Working

**Issue**: API endpoints return 404 or errors
**Solution**:
- Check that API routes are in `pages/api/` directory
- Verify function timeout settings in `vercel.json`
- Check serverless function logs in Vercel dashboard

### Environment Variables Not Working

**Issue**: `process.env.VARIABLE` is undefined
**Solution**:
- Ensure variable name matches exactly (case-sensitive)
- Variables starting with `NEXT_PUBLIC_` are exposed to browser
- Redeploy after adding/updating environment variables
- Restart development server if testing locally

### Image Optimization Issues

**Issue**: Images not loading or optimization errors
**Solution**:
- Check `next.config.js` for image domain configurations
- Verify remote image domains are whitelisted
- Check Vercel image optimization settings

## Performance Optimization

Vercel automatically optimizes Next.js applications:
- ✅ Automatic image optimization
- ✅ Edge caching
- ✅ Serverless functions
- ✅ CDN distribution
- ✅ Automatic HTTPS

## Monitoring

Vercel provides built-in monitoring:
- **Analytics**: View page views and performance
- **Logs**: Check serverless function logs
- **Speed Insights**: Monitor Core Web Vitals

Access these in your Vercel project dashboard.

## Continuous Deployment

Vercel automatically deploys on:
- Push to main branch → Production
- Push to other branches → Preview deployment
- Pull requests → Preview deployment

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Next.js build output
3. Check MongoDB connection status
4. Verify all environment variables are set correctly

---

**Note**: The `output: 'standalone'` setting in `next.config.js` is compatible with Vercel, but Vercel uses its own optimized deployment method. The standalone output is fine to keep, but not required for Vercel deployment.

