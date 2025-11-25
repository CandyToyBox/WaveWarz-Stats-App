# 🚀 Quick Start Guide - Your Analytics Database is Ready!

Since you already have your Analytics Supabase database set up, let's get you deployed in 5 steps.

---

## ✅ Step 1: Set Up Database Schema (5 minutes)

1. **Go to your Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/sql/new
   ```

2. **Copy the contents of `supabase-schema.sql`**

3. **Paste into SQL Editor and click "Run"**

This creates all the tables you need:
- `battles_cache` - Cached battle data
- `analytics_snapshots` - Platform stats
- `artist_stats` - Leaderboards
- `sync_log` - Sync audit trail
- `api_usage_log` - API tracking

---

## ✅ Step 2: Get Your Service Role Key (2 minutes)

1. **Go to your Supabase API Settings**:
   ```
   https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/settings/api
   ```

2. **Copy the `service_role` key** (NOT the anon key)
   - It starts with `eyJhbGc...` and is much longer
   - This key has full database access (keep it secret!)

3. **Save it** - you'll add it to Vercel environment variables

---

## ✅ Step 3: Get Official WaveWarz Database Credentials (From Co-Founder)

Your co-founder needs to provide you with **read-only** credentials:

**What to ask for:**
```
1. Official WaveWarz Supabase URL
2. Read-only anon key (or dedicated read-only user credentials)
```

**Important**: Make sure they create a **read-only user** to keep their database safe!

### Instructions for Your Co-Founder:

Send them this SQL script to run in their Supabase SQL Editor:

```sql
-- Create a read-only user for analytics
CREATE USER analytics_reader WITH PASSWORD 'secure_password_here';

-- Grant only SELECT permissions
GRANT CONNECT ON DATABASE postgres TO analytics_reader;
GRANT USAGE ON SCHEMA public TO analytics_reader;
GRANT SELECT ON battles TO analytics_reader;
GRANT SELECT ON artists TO analytics_reader;
-- Add other tables as needed

-- Explicitly revoke write permissions
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM analytics_reader;
```

Or they can just provide their **anon key** which is read-only by default through RLS policies.

---

## ✅ Step 4: Generate API Secrets (1 minute)

Generate strong secrets for your API:

```bash
# Generate API_SECRET
openssl rand -hex 32
# Copy the output, this is your API_SECRET

# Generate FARCASTER_API_KEY (can be any string)
openssl rand -hex 16
# Copy the output, this is your FARCASTER_API_KEY
```

Or use an online generator: https://generate-secret.vercel.app/32

---

## ✅ Step 5: Deploy to Vercel (10 minutes)

### Option A: Vercel CLI (Fastest)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? wavewarz-analytics (or your choice)
# - Directory? ./
# - Override settings? No

# 4. This creates a preview deployment
# Note the URL it gives you
```

### Option B: Vercel Dashboard

1. **Go to Vercel**: https://vercel.com/new
2. **Import your GitHub repository**
3. **Configure**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Click "Deploy"** (will fail first time - that's OK!)

---

## ✅ Step 6: Add Environment Variables to Vercel

1. **Go to your Vercel project dashboard**:
   ```
   https://vercel.com/dashboard → Your Project → Settings → Environment Variables
   ```

2. **Add these variables** (one by one):

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `ANALYTICS_SUPABASE_URL` | `https://gshwqoplsxgqbdkssoit.supabase.co` | ✅ You have this |
| `ANALYTICS_SUPABASE_SERVICE_KEY` | `eyJhbGc...` | From Step 2 above |
| `OFFICIAL_WAVEWARZ_URL` | `https://xxx.supabase.co` | From co-founder (Step 3) |
| `OFFICIAL_WAVEWARZ_ANON_KEY` | `eyJhbGc...` | From co-founder (Step 3) |
| `API_SECRET` | Generated value | From Step 4 |
| `FARCASTER_API_KEY` | Generated value | From Step 4 |
| `ALLOW_PUBLIC_API` | `true` | Set to `true` for public read access |

3. **Select "Production, Preview, and Development"** for each variable

4. **Click "Save"** for each one

---

## ✅ Step 7: Redeploy with Environment Variables

```bash
# If using Vercel CLI
vercel --prod

# Or in Vercel Dashboard
# Go to Deployments → Click "..." → Redeploy
```

---

## ✅ Step 8: Test Your API! 🎉

Once deployed, test your endpoints:

```bash
# Replace YOUR-APP-URL with your actual Vercel URL
# Example: https://wavewarz-analytics.vercel.app

# 1. Test stats endpoint
curl "https://YOUR-APP-URL/api/stats"

# 2. Run initial sync (replace API_SECRET with your actual secret)
curl -X POST "https://YOUR-APP-URL/api/sync?api_secret=YOUR_API_SECRET&limit=10"

# 3. Check if battles were synced
curl "https://YOUR-APP-URL/api/battles?limit=5"

# 4. Get leaderboard
curl "https://YOUR-APP-URL/api/leaderboard?limit=10"
```

---

## 🎯 Your API Endpoints

Once deployed, you'll have:

```
Base URL: https://your-app.vercel.app

POST /api/sync                 - Sync battles (requires API_SECRET)
GET  /api/stats                - Platform statistics
GET  /api/battles              - List battles
GET  /api/battle/[id]          - Single battle details
GET  /api/leaderboard          - Top artists
```

---

## 📊 Verify Database Tables

Check your Supabase Table Editor to see if data is populated:

1. **battles_cache** - Should have battle records after sync
2. **sync_log** - Should show sync operations
3. **artist_stats** - Leaderboard data (populated after sync)

Go to: https://supabase.com/dashboard/project/gshwqoplsxgqbdkssoit/editor

---

## ⚙️ Set Up Automatic Syncing

### For Vercel Pro (Cron Jobs):
- Already configured in `vercel.json`
- Go to: Settings → Cron Jobs → Enable

### For Vercel Free (External Cron):
Use [cron-job.org](https://cron-job.org):
1. Sign up (free)
2. Create new cron job
3. URL: `https://your-app.vercel.app/api/sync?api_secret=YOUR_SECRET`
4. Schedule: `*/5 * * * *` (every 5 minutes)
5. Method: POST

---

## 🐛 Troubleshooting

### "Sync fails with 500 error"
- Check that you added the SERVICE_ROLE_KEY (not anon key)
- Verify database schema was created
- Check Vercel function logs

### "No data in battles_cache"
- Make sure Official WaveWarz credentials are correct
- Check their database table is named `battles` (adjust in code if different)
- Look at `sync_log` table for error messages

### "Cannot connect to official DB"
- Verify the URL and anon key from co-founder
- Test the credentials directly in their Supabase dashboard
- Make sure they didn't give you an expired key

---

## 🎨 Next: Build Your Farcaster Mini App!

Once your API is working, follow **`OHARA_INTEGRATION.md`** to build your Farcaster mini app on ohara.ai.

You'll use your API URL as the data source:
```javascript
const API_BASE = 'https://your-app.vercel.app';
```

---

## 📞 Need Help?

- Check function logs in Vercel dashboard
- Check `sync_log` table in Supabase for sync errors
- Verify all environment variables are set correctly
- Make sure database schema was created successfully

---

## ✅ Checklist

Before proceeding:

- [ ] Database schema created in Supabase
- [ ] Service role key obtained
- [ ] Official WaveWarz credentials received from co-founder
- [ ] API secrets generated
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Redeployed after adding env vars
- [ ] Initial sync completed successfully
- [ ] API endpoints return data
- [ ] Set up automatic syncing

**You're ready to build! 🚀**
