// Database Schema matches the provided Supabase structure
export interface BattleRecord {
  id: string;
  battle_id: number;
  created_at: string;
  status: 'Active' | 'Completed' | 'Pending';
  artist1_name: string;
  artist2_name: string;
  artist1_wallet: string;
  artist2_wallet: string;
  wavewarz_wallet: string;
  artist1_music_link: string;
  artist2_music_link: string;
  image_url: string;
  artist1_pool: number; // In Lamports
  artist2_pool: number; // In Lamports
  artist1_supply: number;
  artist2_supply: number;
  battle_duration: number;
  winner_decided: boolean;
  winner_artist_a: boolean | null;
  artist1_twitter: string | null;
  artist2_twitter: string | null;
  stream_link: string | null;
  isTest?: boolean; // Derived flag for filtering
}

export interface EventGroup {
  date: string;
  battles: BattleRecord[];
  totalVolumeSol: number;
}

export interface PlatformStats {
  totalVolumeSol: number;
  totalVolumeUsd: number;
  totalBattles: number;
  totalArtistEarningsUsd: number;
  totalSpotifyStreamsEquivalent: number;
  activeBattles: number;
  totalTestVolumeSol: number;
}

export interface ArtistStats {
  name: string;
  wallet: string;
  totalEarningsSol: number;
  battlesParticipated: number;
  wins: number;
}

// IDL Related Types
export enum TransactionState {
  Idle,
  InProgress
}

export interface BattleAccount {
  battle_id: number; // u64
  battle_bump: number; // u8
  artist_a_mint_bump: number;
  artist_b_mint_bump: number;
  battle_vault_bump: number;
  start_time: number; // i64
  end_time: number; // i64
  artist_a_wallet: string; // pubkey
  artist_b_wallet: string; // pubkey
  artist_a_supply: number; // u64
  artist_b_supply: number; // u64
  artist_a_pool: number; // u64
  artist_b_pool: number; // u64
  winner_artist_a: boolean;
  winner_decided: boolean;
  is_active: boolean;
}