# WaveWarz Analytics x ohara.ai Farcaster Mini App Integration

This guide shows you how to integrate WaveWarz Analytics API with your Farcaster mini app built on ohara.ai (Vibecoding on Base L2).

---

## 🎯 Overview

Your **WaveWarz Analytics API** serves as the **source of truth** for:
- Live battle data
- Platform statistics
- Artist leaderboards
- Battle history and results

Your **Farcaster mini app** on ohara.ai will:
- Consume this API
- Display real-time stats in Farcaster frames
- Show leaderboards and active battles
- Enable social sharing on Farcaster

---

## 🔑 Step 1: Get Your API Credentials

After deploying to Vercel, you'll have:

```
API Base URL: https://wavewarz-analytics.vercel.app
Farcaster API Key: [Set this in Vercel environment variables]
```

**For ohara.ai integration**, you'll need:
- `API_BASE_URL` - Your Vercel deployment URL
- `FARCASTER_API_KEY` - The API key you set in Vercel env vars

---

## 📡 Step 2: API Endpoints for Your Mini App

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Platform statistics |
| `/api/battles` | GET | List of battles |
| `/api/battle/{id}` | GET | Single battle details |
| `/api/leaderboard` | GET | Top artists |

### Authentication

If you set `ALLOW_PUBLIC_API=true` in Vercel, these endpoints are publicly accessible. Otherwise, include the API key:

```javascript
// In your ohara.ai mini app
const headers = {
  'X-Api-Key': 'your-farcaster-api-key'
};
```

---

## 💻 Step 3: Code Samples for ohara.ai

### A. Fetch Platform Stats

```javascript
// Fetches overall WaveWarz platform statistics
async function fetchPlatformStats() {
  const API_BASE = 'https://wavewarz-analytics.vercel.app';

  try {
    const response = await fetch(`${API_BASE}/api/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Include API key if ALLOW_PUBLIC_API is false
        // 'X-Api-Key': 'your-api-key'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return result.data;
    // Returns:
    // {
    //   totalVolumeSol: 123.4567,
    //   totalVolumeUsd: 17901.23,
    //   totalBattles: 150,
    //   activeBattles: 5,
    //   completedBattles: 145,
    //   totalArtistEarningsSol: 1.2346,
    //   totalArtistEarningsUsd: 179.01,
    //   totalSpotifyStreamsEquivalent: 59670
    // }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}
```

### B. Fetch Active Battles

```javascript
// Fetches list of active battles
async function fetchActiveBattles(limit = 10) {
  const API_BASE = 'https://wavewarz-analytics.vercel.app';

  try {
    const response = await fetch(
      `${API_BASE}/api/battles?status=Active&limit=${limit}&include_test=false`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    return result.data;
    // Returns array of battles:
    // [
    //   {
    //     id: "uuid",
    //     battle_id: 3243,
    //     status: "Active",
    //     artist1_name: "Artist A",
    //     artist2_name: "Artist B",
    //     image_url: "https://...",
    //     artist1_pool: 1500000000,  // in Lamports
    //     artist2_pool: 1200000000,
    //     artist1_supply: 100,
    //     artist2_supply: 85,
    //     created_at: "2025-11-25T...",
    //     ...
    //   }
    // ]
  } catch (error) {
    console.error('Error fetching battles:', error);
    return [];
  }
}
```

### C. Fetch Leaderboard

```javascript
// Fetches top artists leaderboard
async function fetchLeaderboard(limit = 10, sortBy = 'earnings') {
  const API_BASE = 'https://wavewarz-analytics.vercel.app';

  try {
    const response = await fetch(
      `${API_BASE}/api/leaderboard?limit=${limit}&sort_by=${sortBy}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    return result.data;
    // Returns array of artists:
    // [
    //   {
    //     wallet: "ABC123...",
    //     artist_name: "Top Artist",
    //     total_earnings_sol: 5.4321,
    //     battles_participated: 25,
    //     wins: 15,
    //     win_rate: 60.00,
    //     twitter_handle: "@artist"
    //   }
    // ]
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
```

### D. Fetch Single Battle Details

```javascript
// Fetches detailed info for a specific battle
async function fetchBattleDetails(battleId) {
  const API_BASE = 'https://wavewarz-analytics.vercel.app';

  try {
    const response = await fetch(
      `${API_BASE}/api/battle/${battleId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 404) {
      console.log('Battle not found');
      return null;
    }

    const result = await response.json();

    return result.data;
    // Returns full battle object with blockchain data
  } catch (error) {
    console.error('Error fetching battle:', error);
    return null;
  }
}
```

### E. Utility Functions

```javascript
// Convert Lamports to SOL
function lamportsToSol(lamports) {
  return lamports / 1_000_000_000;
}

// Format SOL amount
function formatSol(lamports) {
  const sol = lamportsToSol(lamports);
  return `◎${sol.toFixed(4)}`;
}

// Format USD amount
function formatUsd(amount) {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Calculate current pool percentages
function calculatePoolPercentages(battle) {
  const total = battle.artist1_pool + battle.artist2_pool;
  if (total === 0) return { artist1: 50, artist2: 50 };

  return {
    artist1: Math.round((battle.artist1_pool / total) * 100),
    artist2: Math.round((battle.artist2_pool / total) * 100)
  };
}
```

---

## 🖼️ Step 4: Creating Farcaster Frames on ohara.ai

### Frame 1: Platform Stats Frame

```javascript
// Platform Stats Frame for Farcaster
import { Frame, Button } from '@coinbase/onchainkit';

export function StatsFrame() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPlatformStats().then(setStats);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <Frame>
      <div className="stats-frame">
        <h1>🎵 WaveWarz Stats</h1>

        <div className="stat-card">
          <span className="label">Total Volume</span>
          <span className="value">
            ◎{stats.totalVolumeSol.toFixed(2)}
            ({formatUsd(stats.totalVolumeUsd)})
          </span>
        </div>

        <div className="stat-card">
          <span className="label">Total Battles</span>
          <span className="value">{stats.totalBattles}</span>
        </div>

        <div className="stat-card">
          <span className="label">Active Now</span>
          <span className="value">{stats.activeBattles}</span>
        </div>

        <div className="stat-card">
          <span className="label">Artist Earnings</span>
          <span className="value">
            {formatUsd(stats.totalArtistEarningsUsd)}
          </span>
        </div>

        <div className="stat-card">
          <span className="label">Spotify Streams Equiv.</span>
          <span className="value">
            {stats.totalSpotifyStreamsEquivalent.toLocaleString()}
          </span>
        </div>

        <Button action="/battles">View Active Battles</Button>
        <Button action="/leaderboard">See Leaderboard</Button>
      </div>
    </Frame>
  );
}
```

### Frame 2: Active Battles Frame

```javascript
// Active Battles Frame for Farcaster
export function BattlesFrame() {
  const [battles, setBattles] = useState([]);

  useEffect(() => {
    fetchActiveBattles(5).then(setBattles);
  }, []);

  return (
    <Frame>
      <div className="battles-frame">
        <h1>🔥 Active Battles</h1>

        {battles.map((battle) => {
          const percentages = calculatePoolPercentages(battle);

          return (
            <div key={battle.battle_id} className="battle-card">
              <img src={battle.image_url} alt="Battle" />

              <div className="battle-matchup">
                <div className="artist">
                  <span className="name">{battle.artist1_name}</span>
                  <span className="pool">
                    {formatSol(battle.artist1_pool)}
                  </span>
                  <span className="percentage">{percentages.artist1}%</span>
                </div>

                <span className="vs">VS</span>

                <div className="artist">
                  <span className="name">{battle.artist2_name}</span>
                  <span className="pool">
                    {formatSol(battle.artist2_pool)}
                  </span>
                  <span className="percentage">{percentages.artist2}%</span>
                </div>
              </div>

              <Button action={`/battle/${battle.battle_id}`}>
                View Details
              </Button>
            </div>
          );
        })}

        <Button action="/stats">Back to Stats</Button>
      </div>
    </Frame>
  );
}
```

### Frame 3: Leaderboard Frame

```javascript
// Leaderboard Frame for Farcaster
export function LeaderboardFrame() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetchLeaderboard(10, 'earnings').then(setArtists);
  }, []);

  return (
    <Frame>
      <div className="leaderboard-frame">
        <h1>🏆 Top Artists</h1>

        <div className="leaderboard">
          {artists.map((artist, index) => (
            <div key={artist.wallet} className="leaderboard-entry">
              <span className="rank">#{index + 1}</span>
              <span className="name">{artist.artist_name}</span>
              <div className="stats">
                <span>◎{artist.total_earnings_sol.toFixed(4)}</span>
                <span>{artist.wins}W / {artist.battles_participated}B</span>
                <span>{artist.win_rate.toFixed(0)}%</span>
              </div>
              {artist.twitter_handle && (
                <a href={`https://twitter.com/${artist.twitter_handle}`}>
                  @{artist.twitter_handle}
                </a>
              )}
            </div>
          ))}
        </div>

        <Button action="/stats">Back to Stats</Button>
      </div>
    </Frame>
  );
}
```

---

## 🎨 Step 5: ohara.ai Configuration

### Project Setup in ohara.ai

1. **Create New Project** on ohara.ai
2. **Select**: Farcaster Frame App
3. **Chain**: Base L2
4. **Framework**: React/Next.js (or your preferred framework)

### Environment Variables in ohara.ai

Add these to your ohara.ai project settings:

```bash
NEXT_PUBLIC_API_BASE=https://wavewarz-analytics.vercel.app
NEXT_PUBLIC_API_KEY=your-farcaster-api-key  # Optional
```

### API Service Module

Create an API service module (`/services/wavewarz-api.js`):

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  ...(API_KEY && { 'X-Api-Key': API_KEY })
};

export const WaveWarzAPI = {
  async getStats() {
    const res = await fetch(`${API_BASE}/api/stats`, { headers });
    return res.json();
  },

  async getBattles(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/battles?${query}`, { headers });
    return res.json();
  },

  async getLeaderboard(limit = 10, sortBy = 'earnings') {
    const res = await fetch(
      `${API_BASE}/api/leaderboard?limit=${limit}&sort_by=${sortBy}`,
      { headers }
    );
    return res.json();
  },

  async getBattle(battleId) {
    const res = await fetch(`${API_BASE}/api/battle/${battleId}`, { headers });
    return res.json();
  }
};
```

---

## 🔄 Step 6: Real-Time Updates (Optional)

For real-time updates in your mini app:

### Option A: Polling

```javascript
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchActiveBattles().then(setBattles);
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, []);
```

### Option B: Webhooks (Advanced)

If you need webhooks, you can extend the API with a webhook endpoint that your mini app can subscribe to. This requires additional setup.

---

## 🚀 Step 7: Deploy Your Farcaster Mini App

### On ohara.ai:

1. **Build your frames** using the code samples above
2. **Test locally** using ohara.ai development environment
3. **Deploy** through ohara.ai dashboard
4. **Share** your frame on Farcaster!

### Frame URL Structure:

```
https://your-app.ohara.ai/frames/stats
https://your-app.ohara.ai/frames/battles
https://your-app.ohara.ai/frames/leaderboard
```

---

## 📊 Step 8: Analytics & Monitoring

### Track API Usage

If you want to track how your mini app uses the API:

```javascript
// Log API calls
async function loggedFetch(endpoint, options) {
  const startTime = Date.now();

  try {
    const response = await fetch(endpoint, options);
    const duration = Date.now() - startTime;

    console.log(`API Call: ${endpoint} - ${response.status} - ${duration}ms`);

    return response;
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
}
```

---

## 🎯 Complete Example: Mini App Entry Point

```javascript
// app/page.tsx (or main entry point)
import { useState, useEffect } from 'react';
import { WaveWarzAPI } from '@/services/wavewarz-api';

export default function WaveWarzMiniApp() {
  const [view, setView] = useState('stats'); // 'stats', 'battles', 'leaderboard'
  const [stats, setStats] = useState(null);
  const [battles, setBattles] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [view]);

  async function loadData() {
    setLoading(true);
    try {
      if (view === 'stats') {
        const data = await WaveWarzAPI.getStats();
        setStats(data.data);
      } else if (view === 'battles') {
        const data = await WaveWarzAPI.getBattles({
          status: 'Active',
          limit: 10
        });
        setBattles(data.data);
      } else if (view === 'leaderboard') {
        const data = await WaveWarzAPI.getLeaderboard(10, 'earnings');
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wavewarz-mini-app">
      <header>
        <h1>🎵 WaveWarz Analytics</h1>
        <nav>
          <button onClick={() => setView('stats')}>Stats</button>
          <button onClick={() => setView('battles')}>Battles</button>
          <button onClick={() => setView('leaderboard')}>Leaderboard</button>
        </nav>
      </header>

      <main>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {view === 'stats' && <StatsView stats={stats} />}
            {view === 'battles' && <BattlesView battles={battles} />}
            {view === 'leaderboard' && <LeaderboardView artists={leaderboard} />}
          </>
        )}
      </main>
    </div>
  );
}
```

---

## ✅ Integration Checklist

Before launching your Farcaster mini app:

- [ ] Vercel API is deployed and working
- [ ] All environment variables are set in ohara.ai
- [ ] API endpoints return data successfully
- [ ] Frames display correctly in ohara.ai preview
- [ ] Error handling is in place
- [ ] Loading states are handled
- [ ] Images and media load properly
- [ ] Links and buttons work as expected
- [ ] Test on actual Farcaster client
- [ ] Monitor API usage and rate limits

---

## 🎉 You're All Set!

Your WaveWarz Analytics API is now the **source of truth** for your Farcaster mini app on ohara.ai. The architecture ensures:

✅ **Official WaveWarz DB remains safe** (read-only access)
✅ **Real-time blockchain data** is enriched and cached
✅ **Fast API responses** for your mini app users
✅ **Scalable infrastructure** on Vercel + Supabase
✅ **Single source of truth** for all WaveWarz analytics

Share your mini app on Farcaster and let the community engage with WaveWarz stats! 🎵🔥
