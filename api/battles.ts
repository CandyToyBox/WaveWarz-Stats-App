import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnalyticsDBClient } from '../lib/supabaseClient';

/**
 * API Endpoint: GET /api/battles
 *
 * Fetches battles from the analytics database
 *
 * Query Parameters:
 * - status: Filter by status ('Active', 'Completed', 'Pending')
 * - limit: Number of battles to return (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - include_test: Include test battles (default: false)
 * - artist: Filter by artist name (partial match)
 * - api_key: API key for authentication (optional if public)
 *
 * Example:
 * GET /api/battles?status=Active&limit=10&include_test=false
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
    // Optional: Verify API key if you want to protect this endpoint
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const allowPublicAccess = process.env.ALLOW_PUBLIC_API === 'true';

    if (!allowPublicAccess && apiKey !== process.env.FARCASTER_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse query parameters
    const status = req.query.status as string | undefined;
    const limit = Math.min(
      parseInt((req.query.limit as string) || '20'),
      100
    );
    const offset = parseInt((req.query.offset as string) || '0');
    const includeTest = req.query.include_test === 'true';
    const artist = req.query.artist as string | undefined;

    // Get analytics DB client
    const analyticsDB = getAnalyticsDBClient();

    // Build query
    let query = analyticsDB
      .from('battles_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (!includeTest) {
      query = query.eq('is_test', false);
    }

    if (artist) {
      query = query.or(`artist1_name.ilike.%${artist}%,artist2_name.ilike.%${artist}%`);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      pagination: {
        limit,
        offset,
        hasMore: data?.length === limit
      }
    });
  } catch (error: any) {
    console.error('Battles endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
