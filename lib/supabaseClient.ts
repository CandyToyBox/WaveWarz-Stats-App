import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Official WaveWarz Database Client (Read-Only)
 * Used to fetch battle metadata, images, and artist info
 */
export const getOfficialDBClient = (): SupabaseClient => {
  const url = process.env.OFFICIAL_WAVEWARZ_URL;
  const key = process.env.OFFICIAL_WAVEWARZ_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Official WaveWarz Supabase credentials');
  }

  return createClient(url, key);
};

/**
 * Analytics Database Client (Read/Write)
 * Used to store cached and enriched battle data
 */
export const getAnalyticsDBClient = (): SupabaseClient => {
  const url = process.env.ANALYTICS_SUPABASE_URL;
  const key = process.env.ANALYTICS_SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error('Missing Analytics Supabase credentials');
  }

  return createClient(url, key);
};

/**
 * Type definitions for database tables
 */
export interface OfficialBattle {
  id: string;
  battle_id: number;
  created_at: string;
  status: 'Active' | 'Completed' | 'Pending';
  artist1: string;
  artist2: string;
  duration: number;
  img: string;
  artist1_music_link?: string;
  artist2_music_link?: string;
  artist1_twitter?: string;
  artist2_twitter?: string;
  stream_link?: string;
  // Add other fields as they exist in the official DB
}

export interface BattleCacheRecord {
  id: string;
  battle_id: number;
  created_at: string;
  status: 'Active' | 'Completed' | 'Pending';
  artist1_name: string;
  artist2_name: string;
  artist1_wallet: string;
  artist2_wallet: string;
  wavewarz_wallet?: string;
  image_url?: string;
  artist1_music_link?: string;
  artist2_music_link?: string;
  artist1_twitter?: string;
  artist2_twitter?: string;
  stream_link?: string;
  artist1_pool: number;
  artist2_pool: number;
  artist1_supply: number;
  artist2_supply: number;
  battle_duration: number;
  winner_decided: boolean;
  winner_artist_a: boolean | null;
  is_test: boolean;
  last_synced_at: string;
  blockchain_data?: any;
}

export interface AnalyticsSnapshot {
  id?: string;
  snapshot_time: string;
  snapshot_type: 'hourly' | 'daily' | 'weekly';
  total_volume_sol: number;
  total_volume_usd: number;
  total_battles: number;
  active_battles: number;
  completed_battles: number;
  total_artist_earnings_sol: number;
  total_artist_earnings_usd: number;
  total_spotify_streams_equivalent: number;
  total_test_volume_sol: number;
  platform_stats?: any;
}

export interface SyncLogRecord {
  id?: string;
  sync_started_at: string;
  sync_completed_at?: string;
  sync_status: 'in_progress' | 'completed' | 'failed';
  battles_fetched: number;
  battles_synced: number;
  blockchain_queries: number;
  errors?: any;
  error_message?: string;
  sync_type: 'scheduled' | 'manual' | 'webhook';
  sync_details?: any;
}
