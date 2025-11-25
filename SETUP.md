# WaveWarz Analytics - Complete Setup Guide

This guide walks you through setting up the WaveWarz Analytics application with read-only access to the official WaveWarz database and deployment to Vercel.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (free tier works)
- Two Supabase projects:
  1. **Official WaveWarz Database** (read-only access from your co-founder)
  2. **Analytics Database** (your own project for cached data)

---

## 🔧 Part 1: Supabase Setup

### Step 1: Get Official WaveWarz Database Credentials

Your co-founder needs to provide you with **read-only** credentials:

```env
OFFICIAL_WAVEWARZ_URL=https://[project-id].supabase.co
OFFICIAL_WAVEWARZ_ANON_KEY=eyJhbGc...
```

**For your co-founder**: See instructions in the repository for creating a read-only user. This ensures your official database is protected.

### Step 2: Create Your Analytics Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (e.g., "wavewarz-analytics")
3. Wait for the database to initialize
4. Note your credentials:
   - Project URL: `https://[your-project-id].supabase.co`
   - Service Role Key: Found in Settings → API → service_role key

### Step 3: Run Database Schema

1. Open your Analytics Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase-schema.sql` from this repository
4. Paste and click **Run**

This creates all necessary tables:
- `battles_cache` - Cached battle data + blockchain enrichment
- `analytics_snapshots` - Time-series platform stats
- `sync_log` - Sync operation audit log
- `artist_stats` - Pre-computed leaderboard
- `api_usage_log` - API usage tracking

---

## 🚀 Part 2: Local Development Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values:

```env
# Official WaveWarz DB (from your co-founder)
OFFICIAL_WAVEWARZ_URL=https://xxx.supabase.co
OFFICIAL_WAVEWARZ_ANON_KEY=eyJhbGc...

# Your Analytics DB
ANALYTICS_SUPABASE_URL=https://yyy.supabase.co
ANALYTICS_SUPABASE_SERVICE_KEY=eyJhbGc...

# Generate a secure secret
API_SECRET=your-secret-key-here

# For Farcaster mini app
FARCASTER_API_KEY=your-farcaster-api-key

# Allow public read access
ALLOW_PUBLIC_API=true
```

### Step 3: Test Locally

```bash
# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

To test API endpoints locally, you'll need to use Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run serverless functions locally
vercel dev
```

This starts the local server with API functions at `http://localhost:3000`

### Step 4: Test the Sync Endpoint

```bash
# Trigger a manual sync
curl -X POST "http://localhost:3000/api/sync?api_secret=your-secret-key-here&limit=10"
```

You should see:
```json
{
  "success": true,
  "message": "Successfully synced X battles",
  "battlesSynced": X,
  "syncLogId": "..."
}
```

Check your Analytics Supabase database - you should see data in `battles_cache`!

### Step 5: Test Other API Endpoints

```bash
# Get battles
curl "http://localhost:3000/api/battles?limit=5"

# Get stats
curl "http://localhost:3000/api/stats"

# Get leaderboard
curl "http://localhost:3000/api/leaderboard?limit=10"

# Get single battle
curl "http://localhost:3000/api/battle/3243"
```

---

## 🌐 Part 3: Deploy to Vercel

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# First deployment (follow prompts)
vercel

# Production deployment
vercel --prod
```

Vercel will ask:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account/team
- **Link to existing project?** → No
- **Project name?** → wavewarz-analytics (or your choice)
- **Directory?** → ./ (root)
- **Override settings?** → No

### Step 4: Configure Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to **Settings → Environment Variables**
3. Add all variables from `.env.local`:

| Name | Value | Environment |
|------|-------|-------------|
| `OFFICIAL_WAVEWARZ_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `OFFICIAL_WAVEWARZ_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development |
| `ANALYTICS_SUPABASE_URL` | `https://yyy.supabase.co` | Production, Preview, Development |
| `ANALYTICS_SUPABASE_SERVICE_KEY` | `eyJhbGc...` | Production, Preview, Development |
| `API_SECRET` | `your-secret` | Production, Preview, Development |
| `FARCASTER_API_KEY` | `your-key` | Production, Preview, Development |
| `ALLOW_PUBLIC_API` | `true` | Production, Preview, Development |

4. Click **Save** for each variable

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

### Step 6: Verify Deployment

Your app is now live! Your URLs will be:

- **Frontend**: `https://wavewarz-analytics.vercel.app`
- **API Endpoints**: `https://wavewarz-analytics.vercel.app/api/*`

Test the deployed API:

```bash
# Replace with your actual Vercel URL
curl "https://wavewarz-analytics.vercel.app/api/stats"
```

---

## ⚙️ Part 4: Set Up Automatic Syncing

### Option A: Vercel Cron Jobs (Recommended)

The `vercel.json` file includes a cron configuration that runs every 5 minutes:

```json
"crons": [
  {
    "path": "/api/sync?api_secret=$API_SECRET",
    "schedule": "*/5 * * * *"
  }
]
```

**Enable Cron Jobs:**
1. Go to Vercel dashboard → Your project
2. Navigate to **Settings → Cron Jobs**
3. Verify the cron job is listed and enabled

**Note**: Cron jobs are only available on Pro plans. For free tier, use Option B.

### Option B: External Cron Service (Free Tier)

Use a free service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. Sign up for a free account
2. Create a new cron job:
   - **URL**: `https://wavewarz-analytics.vercel.app/api/sync?api_secret=YOUR_SECRET`
   - **Method**: POST
   - **Schedule**: Every 5 minutes (*/5 * * * *)

### Option C: GitHub Actions

Create `.github/workflows/sync-battles.yml`:

```yaml
name: Sync Battle Data
on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X POST "https://wavewarz-analytics.vercel.app/api/sync?api_secret=${{ secrets.API_SECRET }}"
```

Add `API_SECRET` to your GitHub repository secrets.

---

## 🔒 Security Checklist

- ✅ Official WaveWarz DB uses read-only credentials
- ✅ Analytics DB service key is kept secret
- ✅ API_SECRET is strong (use `openssl rand -hex 32`)
- ✅ Environment variables are in Vercel, not in code
- ✅ `.env.local` is in `.gitignore`
- ✅ CORS headers configured in `vercel.json`
- ✅ API key required for Farcaster mini app (optional)

---

## 📊 API Endpoints Reference

Once deployed, your analytics API provides these endpoints:

### **POST /api/sync**
Triggers battle data synchronization
```bash
curl -X POST "https://your-app.vercel.app/api/sync?api_secret=YOUR_SECRET"
```

**Query Parameters:**
- `api_secret` (required) - Your API secret
- `limit` (optional) - Number of battles to sync (default: 100)
- `full` (optional) - Set to 'true' for full sync

### **GET /api/battles**
Returns list of battles
```bash
curl "https://your-app.vercel.app/api/battles?status=Active&limit=10"
```

**Query Parameters:**
- `status` (optional) - Filter by status: 'Active', 'Completed', 'Pending'
- `limit` (optional) - Number of battles (default: 20, max: 100)
- `offset` (optional) - Pagination offset
- `include_test` (optional) - Include test battles (default: false)
- `artist` (optional) - Filter by artist name
- `api_key` (optional) - For authenticated access

### **GET /api/stats**
Returns platform statistics
```bash
curl "https://your-app.vercel.app/api/stats"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVolumeSol": 123.4567,
    "totalVolumeUsd": 17901.23,
    "totalBattles": 150,
    "activeBattles": 5,
    "completedBattles": 145,
    "totalArtistEarningsSol": 1.2346,
    "totalArtistEarningsUsd": 179.01,
    "totalSpotifyStreamsEquivalent": 59670
  }
}
```

### **GET /api/leaderboard**
Returns top artists
```bash
curl "https://your-app.vercel.app/api/leaderboard?limit=20"
```

**Query Parameters:**
- `limit` (optional) - Number of artists (default: 10, max: 50)
- `sort_by` (optional) - 'earnings' (default), 'wins', or 'battles'

### **GET /api/battle/[id]**
Returns single battle details
```bash
curl "https://your-app.vercel.app/api/battle/3243"
```

---

## 🐛 Troubleshooting

### Sync endpoint returns 500 error

**Check:**
1. Environment variables are set correctly in Vercel
2. Official WaveWarz credentials are valid
3. Analytics Supabase database schema is created
4. Check Vercel function logs: Dashboard → Functions → View logs

### No data in battles_cache table

**Solution:**
1. Run a manual sync: `POST /api/sync?api_secret=YOUR_SECRET`
2. Check sync_log table for errors:
   ```sql
   SELECT * FROM sync_log ORDER BY sync_started_at DESC LIMIT 5;
   ```
3. Verify the official DB has a table named `battles` (adjust name in `lib/syncService.ts` if different)

### CORS errors in browser

**Solution:**
The `vercel.json` includes CORS headers. If issues persist:
1. Verify `vercel.json` is deployed
2. Check browser console for specific CORS error
3. Add your domain to allowed origins if needed

### Function timeout errors

**Solution:**
1. Reduce sync batch size: `?limit=50` instead of default 100
2. Increase Vercel function timeout in `vercel.json` (max 60s on Pro plan)
3. Consider breaking large syncs into multiple smaller calls

---

## 📞 Support

For issues or questions:
- Check Vercel function logs
- Review Supabase logs in your Analytics project
- Check sync_log table for sync errors
- Verify all environment variables are set

---

## 🎉 Next Steps

Once deployed, proceed to `OHARA_INTEGRATION.md` for integrating with your Farcaster mini app!
