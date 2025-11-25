import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnalyticsDBClient } from '../lib/supabaseClient';

/**
 * API Endpoint: GET /api/leaderboard
 *
 * Returns top artists ranked by earnings
 *
 * Query Parameters:
 * - limit: Number of artists to return (default: 10, max: 50)
 * - sort_by: 'earnings' (default), 'wins', or 'battles'
 * - api_key: API key for authentication (optional if public)
 *
 * Example:
 * GET /api/leaderboard?limit=20&sort_by=earnings
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optional: Verify API key
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const allowPublicAccess = process.env.ALLOW_PUBLIC_API === 'true';

    if (!allowPublicAccess && apiKey !== process.env.FARCASTER_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse query parameters
    const limit = Math.min(
      parseInt((req.query.limit as string) || '10'),
      50
    );
    const sortBy = (req.query.sort_by as string) || 'earnings';

    // Get analytics DB client
    const analyticsDB = getAnalyticsDBClient();

    // Check if artist_stats table exists and has data
    const { data: artistStats, error: statsError } = await analyticsDB
      .from('artist_stats')
      .select('*')
      .limit(1);

    let data;

    if (statsError || !artistStats || artistStats.length === 0) {
      // Fallback: Calculate from battles_cache
      console.log('Artist stats table empty, calculating from battles_cache');
      data = await calculateLeaderboardFromBattles(analyticsDB, limit, sortBy);
    } else {
      // Use pre-computed artist_stats table
      let query = analyticsDB
        .from('artist_stats')
        .select('*')
        .limit(limit);

      // Apply sorting
      switch (sortBy) {
        case 'wins':
          query = query.order('wins', { ascending: false });
          break;
        case 'battles':
          query = query.order('battles_participated', { ascending: false });
          break;
        case 'earnings':
        default:
          query = query.order('total_earnings_sol', { ascending: false });
          break;
      }

      const { data: statsData, error } = await query;

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }

      data = statsData;
    }

    // Cache for 2 minutes
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      sortBy
    });
  } catch (error: any) {
    console.error('Leaderboard endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * Calculate leaderboard from battles_cache (fallback method)
 */
async function calculateLeaderboardFromBattles(
  analyticsDB: any,
  limit: number,
  sortBy: string
) {
  const LAMPORTS_PER_SOL = 1_000_000_000;
  const ARTIST_FEE_BPS = 100;

  const { data: battles, error } = await analyticsDB
    .from('battles_cache')
    .select('*')
    .eq('is_test', false);

  if (error || !battles) return [];

  // Calculate stats per artist
  const artistMap = new Map<string, any>();

  battles.forEach((battle: any) => {
    // Process Artist 1
    const vol1 = (battle.artist1_pool || 0) / LAMPORTS_PER_SOL;
    const earnings1 = vol1 * (ARTIST_FEE_BPS / 10000);

    if (!artistMap.has(battle.artist1_wallet)) {
      artistMap.set(battle.artist1_wallet, {
        wallet: battle.artist1_wallet,
        artist_name: battle.artist1_name,
        total_earnings_sol: 0,
        battles_participated: 0,
        wins: 0,
        twitter_handle: battle.artist1_twitter
      });
    }

    const stats1 = artistMap.get(battle.artist1_wallet);
    stats1.total_earnings_sol += earnings1;
    stats1.battles_participated += 1;
    if (battle.winner_decided && battle.winner_artist_a) stats1.wins += 1;

    // Process Artist 2
    const vol2 = (battle.artist2_pool || 0) / LAMPORTS_PER_SOL;
    const earnings2 = vol2 * (ARTIST_FEE_BPS / 10000);

    if (!artistMap.has(battle.artist2_wallet)) {
      artistMap.set(battle.artist2_wallet, {
        wallet: battle.artist2_wallet,
        artist_name: battle.artist2_name,
        total_earnings_sol: 0,
        battles_participated: 0,
        wins: 0,
        twitter_handle: battle.artist2_twitter
      });
    }

    const stats2 = artistMap.get(battle.artist2_wallet);
    stats2.total_earnings_sol += earnings2;
    stats2.battles_participated += 1;
    if (battle.winner_decided && !battle.winner_artist_a) stats2.wins += 1;
  });

  // Convert to array and sort
  let leaderboard = Array.from(artistMap.values());

  switch (sortBy) {
    case 'wins':
      leaderboard.sort((a, b) => b.wins - a.wins);
      break;
    case 'battles':
      leaderboard.sort((a, b) => b.battles_participated - a.battles_participated);
      break;
    case 'earnings':
    default:
      leaderboard.sort((a, b) => b.total_earnings_sol - a.total_earnings_sol);
      break;
  }

  return leaderboard.slice(0, limit);
}
