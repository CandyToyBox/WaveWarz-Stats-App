import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnalyticsDBClient } from '../../lib/supabaseClient';

/**
 * API Endpoint: GET /api/battle/[id]
 *
 * Fetches a single battle by battle_id
 *
 * URL Parameters:
 * - id: Battle ID (battle_id from database)
 *
 * Query Parameters:
 * - api_key: API key for authentication (optional if public)
 *
 * Example:
 * GET /api/battle/3243
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

    // Get battle ID from URL
    const battleId = req.query.id;

    if (!battleId) {
      return res.status(400).json({ error: 'Battle ID is required' });
    }

    // Parse battle ID
    const parsedBattleId = parseInt(battleId as string);

    if (isNaN(parsedBattleId)) {
      return res.status(400).json({ error: 'Invalid battle ID' });
    }

    // Get analytics DB client
    const analyticsDB = getAnalyticsDBClient();

    // Fetch battle
    const { data, error } = await analyticsDB
      .from('battles_cache')
      .select('*')
      .eq('battle_id', parsedBattleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Battle not found'
        });
      }
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // Cache for 60 seconds
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Battle detail endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
