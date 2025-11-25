# 🎵 WaveWarz Analytics API

> **Source of Truth for WaveWarz Battle Data & Statistics**

A comprehensive analytics platform that safely reads from the official WaveWarz Supabase database, enriches data with Solana blockchain information, and exposes REST APIs for consumption by Farcaster mini apps and other clients.

---

## 🌟 Features

- ✅ **Read-Only Access** to Official WaveWarz Database (100% safe)
- ✅ **Blockchain Data Enrichment** from Solana
- ✅ **Cached Analytics** in dedicated Supabase database
- ✅ **REST API Endpoints** for easy integration
- ✅ **Auto-Sync Service** to keep data fresh
- ✅ **Farcaster Mini App Ready** with ohara.ai integration
- ✅ **Deployed on Vercel** for global edge performance

---

## 📁 Project Structure

```
WaveWarz-Stats-App/
├── api/                      # Vercel serverless functions
│   ├── sync.ts              # Battle data sync endpoint
│   ├── battles.ts           # Get battles list
│   ├── stats.ts             # Platform statistics
│   ├── leaderboard.ts       # Artist leaderboard
│   └── battle/
│       └── [id].ts          # Single battle details
├── lib/                      # Shared libraries
│   ├── supabaseClient.ts    # Supabase client helpers
│   ├── blockchainService.ts # Solana blockchain queries
│   └── syncService.ts       # Main sync logic
├── components/               # React UI components
├── services/                 # Frontend services
├── supabase-schema.sql      # Analytics DB schema
├── vercel.json              # Vercel configuration
├── .env.example             # Environment variables template
├── SETUP.md                 # Complete setup guide
├── DEPLOY.md                # Quick deployment guide
├── OHARA_INTEGRATION.md     # Farcaster mini app guide
└── package.json
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/CandyToyBox/WaveWarz-Stats-App.git
cd WaveWarz-Stats-App
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

📖 **See [SETUP.md](./SETUP.md) for detailed instructions**

---

## 🔌 API Endpoints

### Base URL

```
Production: https://your-app.vercel.app/api
Local: http://localhost:3000/api
```

### Available Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/sync` | POST | Trigger data sync | Yes (API_SECRET) |
| `/stats` | GET | Platform statistics | Optional |
| `/battles` | GET | List battles | Optional |
| `/battle/:id` | GET | Single battle | Optional |
| `/leaderboard` | GET | Top artists | Optional |

### Example Requests

```bash
# Get platform stats
curl "https://your-app.vercel.app/api/stats"

# Get active battles
curl "https://your-app.vercel.app/api/battles?status=Active&limit=10"

# Get leaderboard
curl "https://your-app.vercel.app/api/leaderboard?limit=20"

# Trigger sync (requires auth)
curl -X POST "https://your-app.vercel.app/api/sync?api_secret=YOUR_SECRET"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Official WaveWarz Supabase (Read-Only)                 │
│  • Battle metadata, images, artist info                 │
└──────────────────┬──────────────────────────────────────┘
                   │ (Read-Only Connection)
                   ↓
┌─────────────────────────────────────────────────────────┐
│  Sync Service (Vercel Serverless)                       │
│  1. Fetch battles from official DB                      │
│  2. Query Solana blockchain for on-chain data           │
│  3. Combine and cache in Analytics DB                   │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  Analytics Supabase (Read/Write)                        │
│  • battles_cache - Enriched battle data                 │
│  • analytics_snapshots - Time-series stats              │
│  • artist_stats - Pre-computed leaderboard              │
│  • sync_log - Sync operation audit trail                │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  REST API (Vercel Edge Functions)                       │
│  • /api/battles - Get battles                           │
│  • /api/stats - Get statistics                          │
│  • /api/leaderboard - Get top artists                   │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  Consumers                                              │
│  • Farcaster Mini App (ohara.ai)                       │
│  • Web Dashboard                                        │
│  • Mobile Apps                                          │
│  • Analytics Tools                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Features

- ✅ **Read-Only Database User** for official WaveWarz DB
- ✅ **Row Level Security** policies enabled
- ✅ **API Key Authentication** for sensitive endpoints
- ✅ **Environment Variables** stored securely in Vercel
- ✅ **CORS Configuration** for cross-origin requests
- ✅ **Rate Limiting** (configurable)

---

## 📊 Database Schema

### Analytics Supabase Tables

**battles_cache**
- Stores battle data from official DB + blockchain enrichment
- Includes pool sizes, supplies, winner info from Solana

**analytics_snapshots**
- Time-series aggregated platform statistics
- Hourly/daily/weekly snapshots

**artist_stats**
- Pre-computed leaderboard data
- Earnings, wins, participation stats

**sync_log**
- Audit trail of all sync operations
- Error tracking and debugging

📖 **See [supabase-schema.sql](./supabase-schema.sql) for complete schema**

---

## 🎯 Use Cases

### 1. Farcaster Mini App on ohara.ai

Build interactive frames showing:
- Live battle stats
- Real-time leaderboards
- Artist profiles
- Platform metrics

📖 **See [OHARA_INTEGRATION.md](./OHARA_INTEGRATION.md) for integration guide**

### 2. Analytics Dashboard

Create dashboards displaying:
- Total volume traded
- Artist earnings over time
- Battle completion rates
- User engagement metrics

### 3. Mobile Apps

Power mobile apps with:
- Push notifications for new battles
- Live battle updates
- Artist following features
- Wallet integration

### 4. Third-Party Integrations

Enable:
- Discord bots with battle stats
- Twitter bots for announcements
- Telegram notifications
- Custom analytics tools

---

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run frontend
npm run dev

# Run API functions locally
vercel dev
```

### Testing API Endpoints

```bash
# Test sync service
npm run test:sync

# Test individual endpoints
npm run test:api
```

### Environment Variables

Required environment variables:

```env
OFFICIAL_WAVEWARZ_URL          # Official DB URL (from co-founder)
OFFICIAL_WAVEWARZ_ANON_KEY     # Read-only anon key
ANALYTICS_SUPABASE_URL         # Your analytics DB URL
ANALYTICS_SUPABASE_SERVICE_KEY # Service role key
API_SECRET                      # Secret for sync endpoint
FARCASTER_API_KEY              # API key for mini app
ALLOW_PUBLIC_API               # true/false
```

---

## 📈 Roadmap

- [ ] WebSocket support for real-time updates
- [ ] GraphQL API endpoint
- [ ] Advanced analytics (cohort analysis, retention)
- [ ] Artist profile pages
- [ ] Battle prediction models
- [ ] Mobile SDK for React Native
- [ ] Discord/Telegram bot integrations

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

- **Documentation**: See [SETUP.md](./SETUP.md)
- **Deployment Help**: See [DEPLOY.md](./DEPLOY.md)
- **Farcaster Integration**: See [OHARA_INTEGRATION.md](./OHARA_INTEGRATION.md)
- **Issues**: Open an issue on GitHub

---

## 🙏 Acknowledgments

- **WaveWarz Team** - For the original platform
- **Supabase** - Database and backend services
- **Vercel** - Serverless deployment platform
- **ohara.ai** - Farcaster frame development tools
- **Solana** - Blockchain infrastructure

---

## 🎉 Get Started

Ready to deploy? Follow these steps:

1. ✅ Read [SETUP.md](./SETUP.md) for complete setup instructions
2. ✅ Deploy using [DEPLOY.md](./DEPLOY.md) guide
3. ✅ Integrate with Farcaster using [OHARA_INTEGRATION.md](./OHARA_INTEGRATION.md)

**Let's build something awesome! 🚀**
