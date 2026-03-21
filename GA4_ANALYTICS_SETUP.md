# GA4 Analytics Setup for Admin Dashboard

The admin analytics dashboard pulls data from Google Analytics 4 via the Data API. Follow these steps to configure it.

## 1. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **IAM & Admin → Service Accounts**
4. Click **Create Service Account**
   - Name: e.g. `analytics-reader`
   - Click **Create and Continue**, then **Done**
5. Click the service account → **Keys** tab → **Add Key** → **Create new key** → **JSON**
6. Download the JSON file

## 2. Grant Access to GA4 Properties

For each site (Corp Crunch, Cnvrsn, Prowess, Qrety, Otto):

1. Open [Google Analytics](https://analytics.google.com/)
2. Go to **Admin** (gear icon) → **Property Access Management**
3. Click **+** → **Add users**
4. Enter the service account email (e.g. `analytics-reader@your-project.iam.gserviceaccount.com`)
5. Role: **Viewer**
6. Save

## 3. Get GA4 Property IDs

Each GA4 property has a numeric ID (not the Measurement ID G-XXXXXXX):

1. In GA4, go to **Admin** → **Property Settings**
2. Copy the **Property ID** (e.g. `123456789`)

## 4. Environment Variables

Add to `.env.local`:

```bash
# Full JSON from the downloaded service account key file (single line, no newlines)
GA_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# GA4 Property IDs (use "properties/NNNNNNNNN" format)
GA_PROPERTY_CORPCRUNCH=properties/123456789
GA_PROPERTY_CNVRSN=properties/234567890
GA_PROPERTY_PROWESS=properties/345678901
GA_PROPERTY_QRETY=properties/456789012
GA_PROPERTY_OTTO=properties/567890123
```

**Note:** The property value must be in the format `properties/NNNNNNNNN` where `NNNNNNNNN` is your GA4 Property ID.

## 5. Enable the API

1. In Google Cloud Console, go to **APIs & Services** → **Enable APIs and Services**
2. Search for **Google Analytics Data API**
3. Enable it

## 6. Test

1. Restart your Next.js dev server
2. Log in to the admin panel
3. Go to **Analytics** in the sidebar
4. Select a site and date range

If you see "Analytics not configured", verify that `GA_SERVICE_ACCOUNT_KEY` is set and the JSON is valid (no line breaks inside the string).

## Metrics Available

| Metric | Description |
|--------|-------------|
| Sessions | Total sessions |
| Page Views | screenPageViews |
| Users | totalUsers |
| Bounce Rate | bounceRate |
| Avg Session Duration | averageSessionDuration |
| Traffic Sources | By sessionSourceMedium |
| Top Pages | By pagePath |
| Countries | By country |
| Devices | By deviceCategory |

## Caching

The API sets `Cache-Control: s-maxage=3600` so responses are cached for 1 hour at the edge. Data does not need to be real-time for the admin dashboard.
