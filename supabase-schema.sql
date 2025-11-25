-- WaveWarz Analytics Database Schema
-- Run this in your Analytics Supabase project (not the official WaveWarz DB)

-- ============================================================================
-- BATTLES CACHE TABLE
-- Stores battle data synced from official DB + blockchain enrichment
-- ============================================================================
CREATE TABLE IF NOT EXISTS battles_cache (
  id UUID PRIMARY KEY,
  battle_id BIGINT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Completed', 'Pending')),

  -- Artist Information
  artist1_name TEXT NOT NULL,
  artist2_name TEXT NOT NULL,
  artist1_wallet TEXT NOT NULL,
  artist2_wallet TEXT NOT NULL,
  wavewarz_wallet TEXT,

  -- Media Links
  image_url TEXT,
  artist1_music_link TEXT,
  artist2_music_link TEXT,
  artist1_twitter TEXT,
  artist2_twitter TEXT,
  stream_link TEXT,

  -- Blockchain Data (in Lamports)
  artist1_pool BIGINT DEFAULT 0,
  artist2_pool BIGINT DEFAULT 0,
  artist1_supply BIGINT DEFAULT 0,
  artist2_supply BIGINT DEFAULT 0,

  -- Battle Configuration
  battle_duration INTEGER NOT NULL,

  -- Results
  winner_decided BOOLEAN DEFAULT false,
  winner_artist_a BOOLEAN,

  -- Metadata
  is_test BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  blockchain_data JSONB,

  -- Indexes
  CONSTRAINT battles_cache_pkey PRIMARY KEY (id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_battles_cache_battle_id ON battles_cache(battle_id);
CREATE INDEX IF NOT EXISTS idx_battles_cache_status ON battles_cache(status);
CREATE INDEX IF NOT EXISTS idx_battles_cache_created_at ON battles_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_cache_is_test ON battles_cache(is_test);
CREATE INDEX IF NOT EXISTS idx_battles_cache_artist1_wallet ON battles_cache(artist1_wallet);
CREATE INDEX IF NOT EXISTS idx_battles_cache_artist2_wallet ON battles_cache(artist2_wallet);

-- ============================================================================
-- ANALYTICS SNAPSHOTS TABLE
-- Stores aggregated platform statistics at different time intervals
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  snapshot_type TEXT DEFAULT 'hourly' CHECK (snapshot_type IN ('hourly', 'daily', 'weekly')),

  -- Platform Metrics
  total_volume_sol NUMERIC(20, 9) NOT NULL,
  total_volume_usd NUMERIC(20, 2) NOT NULL,
  total_battles INTEGER NOT NULL,
  active_battles INTEGER NOT NULL,
  completed_battles INTEGER NOT NULL,

  -- Artist Earnings
  total_artist_earnings_sol NUMERIC(20, 9) NOT NULL,
  total_artist_earnings_usd NUMERIC(20, 2) NOT NULL,
  total_spotify_streams_equivalent BIGINT NOT NULL,

  -- Test Data Tracking
  total_test_volume_sol NUMERIC(20, 9) DEFAULT 0,

  -- Raw Stats JSON
  platform_stats JSONB,

  -- Indexes
  CONSTRAINT analytics_snapshots_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_time ON analytics_snapshots(snapshot_time DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_type ON analytics_snapshots(snapshot_type);

-- ============================================================================
-- SYNC LOG TABLE
-- Tracks all sync operations for debugging and monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  sync_completed_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'in_progress' CHECK (sync_status IN ('in_progress', 'completed', 'failed')),

  -- Sync Metrics
  battles_fetched INTEGER DEFAULT 0,
  battles_synced INTEGER DEFAULT 0,
  blockchain_queries INTEGER DEFAULT 0,

  -- Error Tracking
  errors JSONB,
  error_message TEXT,

  -- Sync Details
  sync_type TEXT DEFAULT 'scheduled' CHECK (sync_type IN ('scheduled', 'manual', 'webhook')),
  sync_details JSONB
);

CREATE INDEX IF NOT EXISTS idx_sync_log_started_at ON sync_log(sync_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(sync_status);

-- ============================================================================
-- ARTIST STATS TABLE (Optional - for faster leaderboard queries)
-- Pre-computed artist statistics
-- ============================================================================
CREATE TABLE IF NOT EXISTS artist_stats (
  wallet TEXT PRIMARY KEY,
  artist_name TEXT NOT NULL,

  -- Performance Metrics
  total_earnings_sol NUMERIC(20, 9) DEFAULT 0,
  total_earnings_usd NUMERIC(20, 2) DEFAULT 0,
  battles_participated INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  win_rate NUMERIC(5, 2) DEFAULT 0,

  -- Social Links
  twitter_handle TEXT,

  -- Metadata
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT artist_stats_pkey PRIMARY KEY (wallet)
);

CREATE INDEX IF NOT EXISTS idx_artist_stats_earnings ON artist_stats(total_earnings_sol DESC);
CREATE INDEX IF NOT EXISTS idx_artist_stats_wins ON artist_stats(wins DESC);

-- ============================================================================
-- API USAGE LOG (Optional - for tracking mini app usage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Request Details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- API Client Identification
  api_key_name TEXT,
  client_type TEXT, -- 'web', 'farcaster_mini_app', 'mobile', etc.

  -- Response Details
  status_code INTEGER,
  response_time_ms INTEGER,

  -- Rate Limiting
  rate_limit_hit BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_api_usage_log_timestamp ON api_usage_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_log_endpoint ON api_usage_log(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_log_api_key ON api_usage_log(api_key_name);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update artist stats (call after syncing battles)
CREATE OR REPLACE FUNCTION update_artist_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear existing stats
  TRUNCATE artist_stats;

  -- Recalculate from battles_cache
  INSERT INTO artist_stats (wallet, artist_name, total_earnings_sol, battles_participated, wins, last_updated_at)
  SELECT
    wallet,
    artist_name,
    SUM(earnings_sol) as total_earnings_sol,
    COUNT(*) as battles_participated,
    SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as wins,
    NOW() as last_updated_at
  FROM (
    -- Artist 1 stats
    SELECT
      artist1_wallet as wallet,
      artist1_name as artist_name,
      (artist1_pool / 1000000000.0) * 0.01 as earnings_sol,
      CASE WHEN winner_decided AND winner_artist_a THEN 1 ELSE 0 END as is_winner
    FROM battles_cache
    WHERE is_test = false

    UNION ALL

    -- Artist 2 stats
    SELECT
      artist2_wallet as wallet,
      artist2_name as artist_name,
      (artist2_pool / 1000000000.0) * 0.01 as earnings_sol,
      CASE WHEN winner_decided AND NOT winner_artist_a THEN 1 ELSE 0 END as is_winner
    FROM battles_cache
    WHERE is_test = false
  ) combined
  GROUP BY wallet, artist_name;

  -- Update win rates
  UPDATE artist_stats
  SET win_rate = CASE
    WHEN battles_participated > 0 THEN (wins::NUMERIC / battles_participated::NUMERIC) * 100
    ELSE 0
  END;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable if you want to add authentication to your API
-- ============================================================================

-- For now, we'll keep it simple and manage access via API keys in serverless functions
-- If you want to enable RLS for direct Supabase client access:

-- ALTER TABLE battles_cache ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE artist_stats ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public read access" ON battles_cache FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON analytics_snapshots FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON artist_stats FOR SELECT USING (true);

-- ============================================================================
-- INITIAL DATA NOTES
-- ============================================================================

-- After running this schema, you'll need to:
-- 1. Run your sync service to populate battles_cache
-- 2. Call update_artist_stats() function to populate artist_stats
-- 3. Set up scheduled jobs to keep data fresh

COMMENT ON TABLE battles_cache IS 'Cached battle data from official WaveWarz DB enriched with blockchain data';
COMMENT ON TABLE analytics_snapshots IS 'Time-series aggregated platform statistics';
COMMENT ON TABLE sync_log IS 'Audit log of all data synchronization operations';
COMMENT ON TABLE artist_stats IS 'Pre-computed artist leaderboard statistics';
