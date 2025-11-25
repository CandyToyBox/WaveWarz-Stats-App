# ✅ Your Setup Progress

## What's Already Configured

✅ **Analytics Supabase URL**: `https://gshwqoplsxgqbdkssoit.supabase.co`
✅ **Analytics Service Role Key**: Configured (keep secret!)
✅ **API_SECRET**: Generated and configured
✅ **FARCASTER_API_KEY**: Generated and configured
✅ **Public API Access**: Enabled

Your `.env.local` file is now configured with these values.

---

## ⚠️ What You Still Need

### 1. Run Database Schema (5 minutes)

**Go to**: https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/sql/new

**Steps**:
1. Open the file `supabase-schema.sql` in this project
2. Copy ALL the contents (Ctrl+A, Ctrl+C)
3. Paste into the SQL Editor in Supabase
4. Click the green "Run" button (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

**Verify tables were created**:
- Go to: https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/editor
- You should see these tables:
  - `battles_cache`
  - `analytics_snapshots`
  - `artist_stats`
  - `sync_log`
  - `api_usage_log`

### 2. Get Official WaveWarz Database Credentials (from your co-founder)

Ask your co-founder for:

**What you need**:
```
1. Official WaveWarz Supabase Project URL
   Example: https://xxxxx.supabase.co

2. Read-only Anon Key
   Example: eyJhbGciOiJIUzI1NiIs...
```

**Message to send your co-founder**:
```
Hey! I'm setting up the WaveWarz Analytics API that will read from our
official database in read-only mode. I need:

1. Your Supabase project URL (https://xxx.supabase.co)
2. Your read-only anon key (or a dedicated read-only user)

This will ONLY have read access - it cannot modify anything in your database.
The API will fetch battle data and enrich it with blockchain information.

Let me know if you want me to set up a dedicated read-only user for extra security!
```

**Once you get these credentials**, update your `.env.local` file:
```env
OFFICIAL_WAVEWARZ_URL=https://their-project-id.supabase.co
OFFICIAL_WAVEWARZ_ANON_KEY=their-anon-key-here
```

---

## 🚀 Deploy to Vercel (Once You Have Official DB Credentials)

### Step 1: Deploy

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add these 7 variables (select "Production, Preview, Development" for each):

| Variable Name | Value |
|---------------|-------|
| `ANALYTICS_SUPABASE_URL` | `https://gshwqoplsxgqbdkssoit.supabase.co` |
| `ANALYTICS_SUPABASE_SERVICE_KEY` | Your service role key (from .env.local) |
| `OFFICIAL_WAVEWARZ_URL` | From co-founder |
| `OFFICIAL_WAVEWARZ_ANON_KEY` | From co-founder |
| `API_SECRET` | `75df7d7b09acb2567e201ec8147c79cd1922a9557fd835a732bbef4dec1c8131` |
| `FARCASTER_API_KEY` | `7660ce5c70501d9bdac0a52400365639` |
| `ALLOW_PUBLIC_API` | `true` |

### Step 3: Redeploy

```bash
vercel --prod
```

### Step 4: Test Your API

```bash
# Replace YOUR-VERCEL-URL with your actual URL
curl "https://YOUR-VERCEL-URL/api/stats"
```

### Step 5: Run Initial Sync

```bash
# This will sync your first 10 battles
curl -X POST "https://YOUR-VERCEL-URL/api/sync?api_secret=75df7d7b09acb2567e201ec8147c79cd1922a9557fd835a732bbef4dec1c8131&limit=10"
```

### Step 6: Verify Data

Check your Supabase Table Editor:
https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/editor

You should see data in:
- `battles_cache` - Battle records
- `sync_log` - Sync operation log

---

## 📊 Your API Endpoints (After Deployment)

```
Base URL: https://your-app.vercel.app

POST /api/sync                 - Sync battles (requires API_SECRET)
GET  /api/stats                - Platform statistics
GET  /api/battles              - List battles
GET  /api/battle/[id]          - Single battle details
GET  /api/leaderboard          - Top artists
```

---

## 🎨 For Your Farcaster Mini App on ohara.ai

Once your API is deployed, use it in your ohara.ai project:

```javascript
const API_BASE = 'https://your-vercel-url.vercel.app';

// Fetch stats
const stats = await fetch(`${API_BASE}/api/stats`).then(r => r.json());

// Fetch active battles
const battles = await fetch(`${API_BASE}/api/battles?status=Active&limit=10`)
  .then(r => r.json());

// Fetch leaderboard
const leaderboard = await fetch(`${API_BASE}/api/leaderboard?limit=20`)
  .then(r => r.json());
```

**Complete integration guide**: See `OHARA_INTEGRATION.md`

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: Your `.env.local` file contains sensitive keys.

**Never commit this file to git!** (It's already in `.gitignore`)

**Your secret keys**:
- **API_SECRET**: `75df7d7b09acb2567e201ec8147c79cd1922a9557fd835a732bbef4dec1c8131`
  - Use this for sync endpoint: `/api/sync?api_secret=YOUR_SECRET`

- **FARCASTER_API_KEY**: `7660ce5c70501d9bdac0a52400365639`
  - Use this in your ohara.ai mini app headers: `X-Api-Key: YOUR_KEY`

**Store these securely!** You'll need them for:
- Vercel environment variables
- Setting up cron jobs
- ohara.ai integration

---

## ✅ Quick Checklist

Before deploying:

- [ ] Run `supabase-schema.sql` in Supabase SQL Editor
- [ ] Verify tables created in Table Editor
- [ ] Get Official WaveWarz URL from co-founder
- [ ] Get Official WaveWarz anon key from co-founder
- [ ] Update `.env.local` with official DB credentials
- [ ] Deploy to Vercel with `vercel --prod`
- [ ] Add all 7 environment variables in Vercel
- [ ] Redeploy after adding env vars
- [ ] Test `/api/stats` endpoint
- [ ] Run initial sync with `/api/sync`
- [ ] Verify data in Supabase

After successful deployment:

- [ ] Set up automatic syncing (cron-job.org or Vercel Cron)
- [ ] Build Farcaster mini app on ohara.ai
- [ ] Test mini app with your API

---

## 🎉 You're Almost Ready!

**Next immediate steps**:
1. ✅ Run the database schema in Supabase
2. ⏳ Get official WaveWarz credentials from co-founder
3. 🚀 Deploy to Vercel

Once deployed, you'll have a production-ready API powering your Farcaster mini app!
