# Quick Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Official WaveWarz Database credentials** from your co-founder
2. ✅ **Analytics Supabase project** created and schema deployed
3. ✅ **Vercel account** (free tier works)

---

## 🚀 Deploy to Vercel (Fastest Method)

### Option 1: Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Project name: wavewarz-analytics
# - Directory: ./
# - Override settings? No

# 4. Add environment variables in Vercel dashboard
# Go to: Settings → Environment Variables
# Add all variables from .env.example

# 5. Deploy to production
vercel --prod
```

### Option 2: Vercel GitHub Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: Add WaveWarz Analytics API and sync service"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   OFFICIAL_WAVEWARZ_URL
   OFFICIAL_WAVEWARZ_ANON_KEY
   ANALYTICS_SUPABASE_URL
   ANALYTICS_SUPABASE_SERVICE_KEY
   API_SECRET
   FARCASTER_API_KEY
   ALLOW_PUBLIC_API
   ```

5. **Deploy**: Click "Deploy"

---

## 🔧 Post-Deployment Setup

### 1. Run Initial Sync

```bash
# Replace with your actual Vercel URL and API secret
curl -X POST "https://your-app.vercel.app/api/sync?api_secret=YOUR_SECRET&limit=50"
```

### 2. Verify API Endpoints

```bash
# Test stats endpoint
curl "https://your-app.vercel.app/api/stats"

# Test battles endpoint
curl "https://your-app.vercel.app/api/battles?limit=5"

# Test leaderboard
curl "https://your-app.vercel.app/api/leaderboard"
```

### 3. Set Up Automatic Syncing

**For Vercel Pro (with Cron Jobs):**
- Cron job is already configured in `vercel.json`
- Go to Vercel dashboard → Settings → Cron Jobs
- Verify it's enabled

**For Free Tier (use external cron):**
- Sign up at [cron-job.org](https://cron-job.org)
- Create job: `POST https://your-app.vercel.app/api/sync?api_secret=YOUR_SECRET`
- Schedule: Every 5 minutes

---

## 📊 Your Deployed URLs

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **API Base**: `https://your-app.vercel.app/api`

### API Endpoints:

```
POST https://your-app.vercel.app/api/sync
GET  https://your-app.vercel.app/api/stats
GET  https://your-app.vercel.app/api/battles
GET  https://your-app.vercel.app/api/leaderboard
GET  https://your-app.vercel.app/api/battle/[id]
```

---

## 🔒 Security Checklist

Before going live:

- [ ] API_SECRET is strong (use `openssl rand -hex 32`)
- [ ] Environment variables are set in Vercel
- [ ] .env.local is NOT committed to git
- [ ] Official WaveWarz credentials are read-only
- [ ] Analytics Supabase service key is kept secret
- [ ] CORS is properly configured
- [ ] Test all endpoints work

---

## 🐛 Troubleshooting

### Build Fails

- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Returns 500 Errors

- Verify environment variables are set
- Check function logs in Vercel dashboard
- Ensure Supabase credentials are correct

### Sync Fails

- Check Analytics Supabase schema is deployed
- Verify Official WaveWarz credentials work
- Check sync_log table for error details

---

## 📚 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Run initial sync
3. ✅ Verify data in Analytics Supabase
4. ✅ Test API endpoints
5. ✅ Set up automatic syncing
6. ✅ Proceed to `OHARA_INTEGRATION.md` for Farcaster mini app

---

## 💡 Tips

- Monitor Vercel function logs for errors
- Check Analytics Supabase for sync_log entries
- Start with small sync batches (limit=10) for testing
- Gradually increase to full syncs once stable

---

## 🎉 Success!

Once deployed and synced, your API is ready to power your Farcaster mini app! 🚀
