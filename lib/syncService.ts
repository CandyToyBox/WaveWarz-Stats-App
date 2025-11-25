import { getOfficialDBClient, getAnalyticsDBClient, OfficialBattle, BattleCacheRecord, SyncLogRecord } from './supabaseClient';
import { fetchMultipleBattlesFromBlockchain, isTestBattle } from './blockchainService';

/**
 * Main sync service that fetches data from official DB and blockchain
 * and stores it in the analytics database
 */
export class SyncService {
  private officialDB;
  private analyticsDB;
  private syncLogId?: string;

  constructor() {
    this.officialDB = getOfficialDBClient();
    this.analyticsDB = getAnalyticsDBClient();
  }

  /**
   * Sync battles from official DB to analytics DB with blockchain enrichment
   */
  async syncBattles(options: {
    limit?: number;
    sinceDate?: string;
    syncType?: 'scheduled' | 'manual' | 'webhook';
  } = {}): Promise<{
    success: boolean;
    battlesSynced: number;
    errors: any[];
    syncLogId?: string;
  }> {
    const { limit = 100, sinceDate, syncType = 'scheduled' } = options;
    const errors: any[] = [];
    let battlesSynced = 0;

    // Create sync log entry
    const syncLog: SyncLogRecord = {
      sync_started_at: new Date().toISOString(),
      sync_status: 'in_progress',
      battles_fetched: 0,
      battles_synced: 0,
      blockchain_queries: 0,
      sync_type: syncType,
      sync_details: { limit, sinceDate }
    };

    try {
      // Insert sync log
      const { data: logData, error: logError } = await this.analyticsDB
        .from('sync_log')
        .insert(syncLog)
        .select()
        .single();

      if (logError) throw logError;
      this.syncLogId = logData.id;

      // Fetch battles from official DB
      let query = this.officialDB
        .from('battles') // Adjust table name if different
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // If sinceDate provided, only fetch newer battles
      if (sinceDate) {
        query = query.gt('created_at', sinceDate);
      }

      const { data: officialBattles, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch from official DB: ${fetchError.message}`);
      }

      if (!officialBattles || officialBattles.length === 0) {
        console.log('No new battles to sync');
        await this.completeSyncLog('completed', 0, 0, 0);
        return { success: true, battlesSynced: 0, errors: [] };
      }

      console.log(`Fetched ${officialBattles.length} battles from official DB`);

      // Extract battle IDs for blockchain queries
      const battleIds = officialBattles.map((b: any) => b.battle_id);

      // Fetch blockchain data in batch
      console.log('Fetching blockchain data...');
      const blockchainData = await fetchMultipleBattlesFromBlockchain(battleIds);

      // Combine official DB data with blockchain data
      const enrichedBattles: BattleCacheRecord[] = officialBattles.map((battle: any) => {
        const bcData = blockchainData.get(battle.battle_id);
        const testFlag = isTestBattle(battle.artist1 || '', battle.artist2 || '');

        return {
          id: battle.id,
          battle_id: battle.battle_id,
          created_at: battle.created_at,
          status: battle.status,
          artist1_name: battle.artist1 || 'Unknown',
          artist2_name: battle.artist2 || 'Unknown',
          artist1_wallet: bcData?.artist_a_wallet || 'unknown',
          artist2_wallet: bcData?.artist_b_wallet || 'unknown',
          wavewarz_wallet: null,
          image_url: battle.img,
          artist1_music_link: battle.artist1_music_link,
          artist2_music_link: battle.artist2_music_link,
          artist1_twitter: battle.artist1_twitter,
          artist2_twitter: battle.artist2_twitter,
          stream_link: battle.stream_link,
          artist1_pool: bcData?.artist_a_pool || 0,
          artist2_pool: bcData?.artist_b_pool || 0,
          artist1_supply: bcData?.artist_a_supply || 0,
          artist2_supply: bcData?.artist_b_supply || 0,
          battle_duration: battle.duration || 0,
          winner_decided: bcData?.winner_decided || false,
          winner_artist_a: bcData?.winner_artist_a || null,
          is_test: testFlag,
          last_synced_at: new Date().toISOString(),
          blockchain_data: bcData ? JSON.parse(JSON.stringify(bcData)) : null
        };
      });

      // Upsert into analytics DB
      console.log('Inserting enriched battles into analytics DB...');
      const { error: upsertError } = await this.analyticsDB
        .from('battles_cache')
        .upsert(enrichedBattles, {
          onConflict: 'battle_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        throw new Error(`Failed to upsert battles: ${upsertError.message}`);
      }

      battlesSynced = enrichedBattles.length;

      // Update artist stats
      console.log('Updating artist stats...');
      await this.updateArtistStats();

      // Complete sync log
      await this.completeSyncLog(
        'completed',
        officialBattles.length,
        battlesSynced,
        battleIds.length
      );

      console.log(`✓ Sync completed: ${battlesSynced} battles synced`);

      return {
        success: true,
        battlesSynced,
        errors,
        syncLogId: this.syncLogId
      };
    } catch (error: any) {
      console.error('Sync error:', error);
      errors.push(error);

      // Update sync log with error
      if (this.syncLogId) {
        await this.completeSyncLog(
          'failed',
          0,
          battlesSynced,
          0,
          error.message
        );
      }

      return {
        success: false,
        battlesSynced,
        errors,
        syncLogId: this.syncLogId
      };
    }
  }

  /**
   * Update artist stats table by recalculating from battles_cache
   */
  private async updateArtistStats(): Promise<void> {
    try {
      // Call the database function to update artist stats
      const { error } = await this.analyticsDB.rpc('update_artist_stats');

      if (error) {
        console.error('Error updating artist stats:', error);
      } else {
        console.log('✓ Artist stats updated');
      }
    } catch (error) {
      console.error('Failed to update artist stats:', error);
    }
  }

  /**
   * Complete the sync log entry
   */
  private async completeSyncLog(
    status: 'completed' | 'failed',
    fetched: number,
    synced: number,
    blockchainQueries: number,
    errorMessage?: string
  ): Promise<void> {
    if (!this.syncLogId) return;

    try {
      await this.analyticsDB
        .from('sync_log')
        .update({
          sync_completed_at: new Date().toISOString(),
          sync_status: status,
          battles_fetched: fetched,
          battles_synced: synced,
          blockchain_queries: blockchainQueries,
          error_message: errorMessage || null
        })
        .eq('id', this.syncLogId);
    } catch (error) {
      console.error('Failed to update sync log:', error);
    }
  }

  /**
   * Get last sync time from sync_log
   */
  async getLastSyncTime(): Promise<string | null> {
    try {
      const { data, error } = await this.analyticsDB
        .from('sync_log')
        .select('sync_completed_at')
        .eq('sync_status', 'completed')
        .order('sync_completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return data.sync_completed_at;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sync only new battles since last successful sync
   */
  async syncNewBattles(): Promise<any> {
    const lastSyncTime = await this.getLastSyncTime();

    return this.syncBattles({
      sinceDate: lastSyncTime || undefined,
      limit: 200,
      syncType: 'scheduled'
    });
  }
}
