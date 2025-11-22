import { INITIAL_BATTLES, SOL_PRICE_USD, ARTIST_FEE_BPS } from '../constants';
import { BattleRecord, PlatformStats, ArtistStats, EventGroup } from '../types';

// Utility to convert Lamports to SOL
const lamportsToSol = (lamports: number) => lamports / 1_000_000_000;

// Utility to calculate "Spotify Equivalent" streams
const calculateStreams = (usdEarnings: number) => {
  return Math.floor(usdEarnings / 0.003);
};

export const getPlatformStats = (): PlatformStats => {
  let totalLamports = 0;
  let totalTestLamports = 0;
  let totalBattles = 0;
  let activeBattles = 0;

  INITIAL_BATTLES.forEach(battle => {
    const poolSum = battle.artist1_pool + battle.artist2_pool;
    
    if (battle.isTest) {
        totalTestLamports += poolSum;
    } else {
        totalLamports += poolSum;
    }

    totalBattles++;
    if (battle.status === 'Active') activeBattles++;
  });

  const totalVolumeSol = lamportsToSol(totalLamports);
  const totalVolumeUsd = totalVolumeSol * SOL_PRICE_USD;
  
  // Artist gets 1% of Total Volume
  const totalArtistEarningsSol = totalVolumeSol * (ARTIST_FEE_BPS / 10000);
  const totalArtistEarningsUsd = totalArtistEarningsSol * SOL_PRICE_USD;

  return {
    totalVolumeSol,
    totalVolumeUsd,
    totalBattles,
    activeBattles,
    totalArtistEarningsUsd,
    totalSpotifyStreamsEquivalent: calculateStreams(totalArtistEarningsUsd),
    totalTestVolumeSol: lamportsToSol(totalTestLamports)
  };
};

export const getBattles = (includeTests: boolean = false): BattleRecord[] => {
  return INITIAL_BATTLES
    .filter(b => includeTests || !b.isTest)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Groups battles into events (group by Day)
export const getEvents = (includeTests: boolean = false): EventGroup[] => {
    const battles = getBattles(includeTests);
    const groups: { [key: string]: BattleRecord[] } = {};

    battles.forEach(b => {
        const dateKey = new Date(b.created_at).toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(b);
    });

    return Object.keys(groups).map(date => ({
        date,
        battles: groups[date],
        totalVolumeSol: groups[date].reduce((acc, b) => acc + lamportsToSol(b.artist1_pool + b.artist2_pool), 0)
    }));
};

export const getTopArtists = (): ArtistStats[] => {
  const artistMap = new Map<string, ArtistStats>();

  INITIAL_BATTLES.forEach(battle => {
    if (battle.isTest) return; // Skip test battles for leaderboards

    // Process Artist 1
    const vol1 = lamportsToSol(battle.artist1_pool);
    const earnings1 = vol1 * (ARTIST_FEE_BPS / 10000);
    
    // Using Name as key here since Wallet IDs were simplified in bulk import
    // In production, use wallet address as unique key
    const key1 = battle.artist1_name;
    if (!artistMap.has(key1)) {
      artistMap.set(key1, {
        name: battle.artist1_name,
        wallet: battle.artist1_wallet,
        totalEarningsSol: 0,
        battlesParticipated: 0,
        wins: 0
      });
    }
    const stat1 = artistMap.get(key1)!;
    stat1.totalEarningsSol += earnings1;
    stat1.battlesParticipated += 1;
    if (battle.winner_decided && battle.winner_artist_a) stat1.wins += 1;

    // Process Artist 2
    const vol2 = lamportsToSol(battle.artist2_pool);
    const earnings2 = vol2 * (ARTIST_FEE_BPS / 10000);

    const key2 = battle.artist2_name;
    if (!artistMap.has(key2)) {
      artistMap.set(key2, {
        name: battle.artist2_name,
        wallet: battle.artist2_wallet,
        totalEarningsSol: 0,
        battlesParticipated: 0,
        wins: 0
      });
    }
    const stat2 = artistMap.get(key2)!;
    stat2.totalEarningsSol += earnings2;
    stat2.battlesParticipated += 1;
    if (battle.winner_decided && battle.winner_artist_a === false) stat2.wins += 1;
  });

  return Array.from(artistMap.values())
    .sort((a, b) => b.totalEarningsSol - a.totalEarningsSol)
    .slice(0, 10);
};
