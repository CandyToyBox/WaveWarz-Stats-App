# 🎯 Your WaveWarz Analytics Setup

## Your Analytics Database Info

**Project URL**: `https://gshwqoplsxgqbdkssoit.supabase.co`
**Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✅

---

## 📝 What You Need to Complete Setup

### 1. ⚠️ Get Your Service Role Key

The anon key you provided is for **read-only** access. For the sync service to write data, you need the **service_role** key.

**How to get it:**
1. Go to: https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/settings/api
2. Scroll to "Project API keys"
3. Copy the **`service_role`** key (NOT the anon key)
4. Keep it secret! This key has full database access

### 2. 📊 Set Up Database Schema

1. Go to SQL Editor: https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/sql/new
2. Open `supabase-schema.sql` from this project
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run" (green play button)

This creates:
- `battles_cache` table
- `analytics_snapshots` table
- `artist_stats` table
- `sync_log` table
- `api_usage_log` table

### 3. 🔐 Get Official WaveWarz Database Credentials

Ask your co-founder for:
- **Official WaveWarz Supabase URL**
- **Read-only anon key** (or dedicated read-only user credentials)

Make sure they provide **read-only** credentials to keep their database safe!

### 4. 🔑 Generate API Secrets

```bash
# Generate API_SECRET (for sync endpoint)
openssl rand -hex 32

# Generate FARCASTER_API_KEY (for mini app)
openssl rand -hex 16
```

Save these - you'll need them for Vercel!

---

## 🚀 Deployment Steps

### Step 1: Complete .env.local File

Edit `.env.local` in this project and fill in:

```env
# Your Analytics DB (already have URL)
ANALYTICS_SUPABASE_URL=https://gshwqoplsxgqbdkssoit.supabase.co
ANALYTICS_SUPABASE_SERVICE_KEY=your-service-role-key-here  # ⚠️ GET THIS

# Official WaveWarz DB (from co-founder)
OFFICIAL_WAVEWARZ_URL=https://xxx.supabase.co  # ⚠️ GET THIS
OFFICIAL_WAVEWARZ_ANON_KEY=eyJhbGc...  # ⚠️ GET THIS

# API Secrets (generate these)
API_SECRET=your-generated-secret  # ⚠️ GENERATE
FARCASTER_API_KEY=your-farcaster-key  # ⚠️ GENERATE
ALLOW_PUBLIC_API=true
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 3: Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables

Add all 7 variables from `.env.local` above.

### Step 4: Redeploy

```bash
vercel --prod
```

### Step 5: Test Your API

```bash
# Test with the script
./test-api.sh https://your-app.vercel.app your-api-secret

# Or manually
curl "https://your-app.vercel.app/api/stats"
```

---

## 📋 Checklist

Complete these in order:

- [ ] Get service role key from Supabase
- [ ] Run `supabase-schema.sql` in SQL Editor
- [ ] Verify tables were created in Table Editor
- [ ] Get Official WaveWarz credentials from co-founder
- [ ] Generate API_SECRET with `openssl rand -hex 32`
- [ ] Generate FARCASTER_API_KEY with `openssl rand -hex 16`
- [ ] Fill in `.env.local` with all values
- [ ] Deploy to Vercel with `vercel --prod`
- [ ] Add all environment variables in Vercel dashboard
- [ ] Redeploy after adding env vars
- [ ] Run initial sync: `POST /api/sync?api_secret=YOUR_SECRET`
- [ ] Verify data in Supabase battles_cache table
- [ ] Test all API endpoints
- [ ] Set up automatic syncing (cron-job.org)

---

## 🎨 Build Your Farcaster Mini App

Once your API is deployed and working, see **`OHARA_INTEGRATION.md`** for complete code samples and integration guide.

Your API URL will be your source of truth for the mini app!

---

## 📞 Quick Links

| Resource | URL |
|----------|-----|
| **Your Supabase Dashboard** | https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit |
| **SQL Editor** | https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/sql/new |
| **Table Editor** | https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/editor |
| **API Settings** | https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/settings/api |
| **Vercel Dashboard** | https://vercel.com/dashboard |

---

## 🎉 You're Almost There!

Follow the steps above, and you'll have a fully working analytics API in about 20 minutes!

**Start with**: Get your service role key → Run schema → Get official DB credentials → Deploy!
