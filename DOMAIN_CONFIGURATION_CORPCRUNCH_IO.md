# Domain Configuration for corpcrunch.io

This document outlines all the settings and configurations required for the `corpcrunch.io` domain.

## ✅ Current Status

The domain `corpcrunch.io` is already referenced in multiple places:
- ✅ Meta tags and Open Graph URLs
- ✅ Sitemap base URL
- ✅ Robots.txt sitemap reference
- ✅ Email addresses (scoop@corpcrunch.io)
- ✅ Social sharing URLs
- ✅ Product subdomain (prowess.corpcrunch.io)

## 🔧 Required Configuration Updates

### 1. Next.js Image Domain Configuration

**File:** `next.config.js`

**Action Required:** Add `corpcrunch.io` to the allowed image domains so images hosted on your domain can be optimized by Next.js.

**Current Issue:** The domain `corpcrunch.io` is NOT in the `remotePatterns` or `domains` array, which means:
- Images from `corpcrunch.io` will need to use `unoptimized={true}` prop
- Or you need to add the domain to the configuration

**Recommended Fix:**
Add the following to `next.config.js`:

```javascript
images: {
  remotePatterns: [
    // ... existing patterns ...
    {
      protocol: 'https',
      hostname: '**.corpcrunch.io',
    },
    {
      protocol: 'https',
      hostname: 'corpcrunch.io',
    },
    {
      protocol: 'https',
      hostname: 'www.corpcrunch.io',
    },
  ],
  domains: [
    // ... existing domains ...
    'corpcrunch.io',
    'www.corpcrunch.io',
    'prowess.corpcrunch.io',
  ],
}
```

### 2. Vercel Domain Configuration

**Steps to Configure Domain in Vercel:**

1. **Add Custom Domain:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter `corpcrunch.io` and `www.corpcrunch.io`
   - Follow Vercel's DNS configuration instructions

2. **DNS Records Required:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel's IP - check Vercel dashboard for current IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com (or value provided by Vercel)
   ```

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates for custom domains
   - Ensure "Force HTTPS" is enabled in Vercel settings

### 3. Environment Variables

**File:** `.env.local` or Vercel Environment Variables

**Required Variables:**
```env
# Base URL for API calls
NEXT_PUBLIC_API_URL=https://www.corpcrunch.io/api

# Or if using separate API domain:
# NEXT_PUBLIC_API_URL=https://api.corpcrunch.io/api

# Production environment
NODE_ENV=production
```

**Vercel Configuration:**
1. Go to **Settings** → **Environment Variables**
2. Add `NEXT_PUBLIC_API_URL` with value `https://www.corpcrunch.io/api`
3. Ensure it's set for **Production**, **Preview**, and **Development** environments

### 4. Security Headers (Already Configured ✅)

The `next.config.js` already includes security headers that work with custom domains:
- ✅ HSTS (Strict-Transport-Security)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy

**Note:** The HSTS header includes `includeSubDomains`, which will apply to all subdomains of `corpcrunch.io`.

### 5. CORS Configuration (If Using Separate API)

If you have a separate API server, ensure CORS allows requests from `corpcrunch.io`:

```javascript
// Example CORS configuration
const allowedOrigins = [
  'https://www.corpcrunch.io',
  'https://corpcrunch.io',
  'https://prowess.corpcrunch.io',
];
```

### 6. Image Hosting on corpcrunch.io

**If hosting images on corpcrunch.io:**

1. **Add to Next.js config** (as mentioned in section 1)
2. **Update image URLs in database:**
   - Ensure image URLs use `https://www.corpcrunch.io/assets/...` format
   - Or use relative paths `/assets/...` for local images

3. **CDN Configuration (Optional):**
   - Consider using Vercel's built-in CDN for static assets
   - Or configure Cloudflare/CDN for `corpcrunch.io`

### 7. Subdomain Configuration

**Existing Subdomain:**
- `prowess.corpcrunch.io` - Already referenced in `pages/products/index.js`

**To Add More Subdomains:**
1. Add DNS CNAME record pointing to Vercel
2. Add subdomain in Vercel dashboard
3. Update `next.config.js` image domains if needed

### 8. Email Configuration

**Current Email:** `scoop@corpcrunch.io`

**Email Service Setup:**
- Configure MX records in DNS for email hosting
- Or use email forwarding service
- Ensure SPF, DKIM, and DMARC records are configured

### 9. SEO & Meta Tags (Already Configured ✅)

**Current Configuration:**
- ✅ Base URL: `https://www.corpcrunch.io/`
- ✅ Sitemap: `https://www.corpcrunch.io/sitemap.xml`
- ✅ Robots.txt: References sitemap correctly
- ✅ Open Graph tags: Use `corpcrunch.io` domain
- ✅ Canonical URLs: Set correctly

### 10. Social Media Links (Already Configured ✅)

Social media links already reference `corpcrunch.io`:
- Facebook: `https://www.facebook.com/corpcrunch`
- Twitter: `https://twitter.com/corpcrunch`
- LinkedIn: `https://www.linkedin.com/company/corpcrunch`
- Instagram: `https://www.instagram.com/corpcrunch`
- YouTube: `https://www.youtube.com/@corpcrunch`
- Behance: `https://www.behance.net/corpcrunch`

## 📋 Pre-Deployment Checklist

Before deploying with `corpcrunch.io` domain:

- [ ] Add `corpcrunch.io` to `next.config.js` image domains
- [ ] Configure domain in Vercel dashboard
- [ ] Set up DNS records (A and CNAME)
- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Verify SSL certificate is active
- [ ] Test website loads on `corpcrunch.io` and `www.corpcrunch.io`
- [ ] Verify images load correctly
- [ ] Test API endpoints work
- [ ] Check sitemap is accessible: `https://www.corpcrunch.io/sitemap.xml`
- [ ] Verify robots.txt: `https://www.corpcrunch.io/robots.txt`
- [ ] Test social sharing (Open Graph tags)
- [ ] Verify email addresses work
- [ ] Check all internal links use correct domain
- [ ] Test HTTPS redirect works
- [ ] Verify security headers are present

## 🔍 Verification Commands

After deployment, verify:

```bash
# Check SSL certificate
curl -I https://www.corpcrunch.io

# Check security headers
curl -I https://www.corpcrunch.io | grep -i "strict-transport-security"

# Check sitemap
curl https://www.corpcrunch.io/sitemap.xml

# Check robots.txt
curl https://www.corpcrunch.io/robots.txt
```

## 🚨 Important Notes

1. **Image Optimization:** If you don't add `corpcrunch.io` to image domains, you'll need to use `unoptimized={true}` on all Image components loading from your domain.

2. **API Routes:** Ensure `NEXT_PUBLIC_API_URL` is set correctly. If using same domain, use `/api` or `https://www.corpcrunch.io/api`.

3. **Subdomains:** Each subdomain (like `prowess.corpcrunch.io`) needs to be added separately in Vercel.

4. **DNS Propagation:** DNS changes can take 24-48 hours to propagate globally.

5. **HTTPS:** Vercel automatically provisions SSL, but ensure "Force HTTPS" is enabled.

## 📝 Next Steps

1. **Immediate:** Add `corpcrunch.io` to `next.config.js` image domains
2. **Before Deployment:** Configure domain in Vercel
3. **After Deployment:** Verify all URLs and functionality
4. **Ongoing:** Monitor SSL certificate expiration (Vercel auto-renews)

