import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnalyticsDBClient } from '../lib/supabaseClient';

const LAMPORTS_PER_SOL = 1_000_000_000;
const SOL_PRICE_USD = 145.0; // You can make this dynamic
const ARTIST_FEE_BPS = 100; // 1%
const STREAMING_RATE_USD = 0.003;

/**
 * API Endpoint: GET /api/stats
 *
 * Returns aggregated platform statistics
 *
 * Query Parameters:
 * - api_key: API key for authentication (optional if public)
 * - include_test: Include test battles in calculations (default: false)
 *
 * Example:
 * GET /api/stats?include_test=false
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

    const includeTest = req.query.include_test === 'true';

    // Get analytics DB client
    const analyticsDB = getAnalyticsDBClient();

    // Fetch all battles
    let query = analyticsDB
      .from('battles_cache')
      .select('*');

    if (!includeTest) {
      query = query.eq('is_test', false);
    }

    const { data: battles, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (!battles) {
      return res.status(200).json({
        success: true,
        data: {
          totalVolumeSol: 0,
          totalVolumeUsd: 0,
          totalBattles: 0,
          activeBattles: 0,
          completedBattles: 0,
          totalArtistEarningsSol: 0,
          totalArtistEarningsUsd: 0,
          totalSpotifyStreamsEquivalent: 0
        }
      });
    }

    // Calculate statistics
    let totalLamports = 0;
    let activeBattles = 0;
    let completedBattles = 0;

    battles.forEach((battle: any) => {
      const poolSum = (battle.artist1_pool || 0) + (battle.artist2_pool || 0);
      totalLamports += poolSum;

      if (battle.status === 'Active') activeBattles++;
      if (battle.status === 'Completed') completedBattles++;
    });

    const totalVolumeSol = totalLamports / LAMPORTS_PER_SOL;
    const totalVolumeUsd = totalVolumeSol * SOL_PRICE_USD;

    // Artist earnings (1% of volume)
    const totalArtistEarningsSol = totalVolumeSol * (ARTIST_FEE_BPS / 10000);
    const totalArtistEarningsUsd = totalArtistEarningsSol * SOL_PRICE_USD;

    // Spotify equivalent streams
    const totalSpotifyStreamsEquivalent = Math.floor(
      totalArtistEarningsUsd / STREAMING_RATE_USD
    );

    const stats = {
      totalVolumeSol: parseFloat(totalVolumeSol.toFixed(4)),
      totalVolumeUsd: parseFloat(totalVolumeUsd.toFixed(2)),
      totalBattles: battles.length,
      activeBattles,
      completedBattles,
      totalArtistEarningsSol: parseFloat(totalArtistEarningsSol.toFixed(4)),
      totalArtistEarningsUsd: parseFloat(totalArtistEarningsUsd.toFixed(2)),
      totalSpotifyStreamsEquivalent,
      lastUpdated: new Date().toISOString()
    };

    // Cache for 60 seconds
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Stats endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
