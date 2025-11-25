import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SyncService } from '../lib/syncService';

/**
 * API Endpoint: POST /api/sync
 *
 * Triggers a sync operation to fetch battles from official DB and blockchain
 *
 * Authentication: Requires API_SECRET in headers or query params
 *
 * Query Parameters:
 * - api_secret: Secret key for authentication
 * - limit: Number of battles to sync (default: 100)
 * - full: If 'true', does full sync ignoring last sync time
 *
 * Example:
 * POST /api/sync?api_secret=your_secret&limit=50
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API secret
  const apiSecret = req.headers['x-api-secret'] || req.query.api_secret;
  const expectedSecret = process.env.API_SECRET;

  if (!expectedSecret) {
    return res.status(500).json({ error: 'API_SECRET not configured' });
  }

  if (apiSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const syncService = new SyncService();

    // Parse options
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const fullSync = req.query.full === 'true';

    let result;

    if (fullSync) {
      console.log('Starting full sync...');
      result = await syncService.syncBattles({
        limit,
        syncType: 'manual'
      });
    } else {
      console.log('Starting incremental sync...');
      result = await syncService.syncNewBattles();
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Successfully synced ${result.battlesSynced} battles`,
        battlesSynced: result.battlesSynced,
        syncLogId: result.syncLogId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Sync completed with errors',
        battlesSynced: result.battlesSynced,
        errors: result.errors,
        syncLogId: result.syncLogId
      });
    }
  } catch (error: any) {
    console.error('Sync endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
