import React, { useEffect, useState } from 'react';
import { getPlatformStats, getTopArtists, getBattles } from '../services/statsService';
import { fetchProgramTransactions, ParsedTransaction } from '../services/solanaService';
import { PlatformStats, ArtistStats, BattleRecord } from '../types';
import StatsCard from './StatsCard';
import { SOL_PRICE_USD } from '../constants';
import { Link } from 'react-router-dom';

// Icons
const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
);
const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [topArtists, setTopArtists] = useState<ArtistStats[]>([]);
  const [recentBattles, setRecentBattles] = useState<BattleRecord[]>([]);
  const [liveTx, setLiveTx] = useState<ParsedTransaction[]>([]);

  useEffect(() => {
    // Load static data
    const platformStats = getPlatformStats();
    const artists = getTopArtists();
    const battles = getBattles(false).slice(0, 5); // Top 5 recent real battles
    
    setStats(platformStats);
    setTopArtists(artists);
    setRecentBattles(battles);

    // Fetch live data from Helius
    fetchProgramTransactions(5).then(txs => {
        setLiveTx(txs);
    });
  }, []);

  if (!stats) return <div className="text-center p-10 text-gray-400 animate-pulse">Syncing with Solana...</div>;

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Volume" 
          value={`$${stats.totalVolumeUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} 
          subValue={`${stats.totalVolumeSol.toLocaleString()} SOL`}
          icon={<ActivityIcon />}
          trend="up"
          trendValue="12.5%"
        />
        <StatsCard 
          title="Artist Earnings" 
          value={`$${stats.totalArtistEarningsUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} 
          subValue="Paid instantly on-chain"
          icon={<DollarIcon />}
          trend="up"
          trendValue="8.2%"
        />
        <StatsCard 
          title="Spotify Equivalent" 
          value={stats.totalSpotifyStreamsEquivalent.toLocaleString()} 
          subValue="Streams generated value"
          icon={<MusicIcon />}
        />
        <StatsCard 
          title="Total Battles" 
          value={stats.totalBattles} 
          subValue={`${stats.activeBattles} Active`}
          icon={<UserIcon />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Battles */}
        <div className="lg:col-span-2 bg-wave-900 border border-wave-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Main Battles</h2>
            <Link to="/battles" className="text-sm text-wave-accent hover:underline">View All & Events</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-wave-800">
                  <th className="pb-3 font-medium">Battle</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Pool (SOL)</th>
                  <th className="pb-3 font-medium text-right">Est. Value</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentBattles.map((battle) => {
                  const totalPool = (battle.artist1_pool + battle.artist2_pool) / 1e9;
                  return (
                    <tr key={battle.id} className="border-b border-wave-800/50 hover:bg-wave-800/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-wave-800 overflow-hidden">
                            <img src={battle.image_url} alt="Battle" className="w-full h-full object-cover opacity-80" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{battle.artist1_name} vs {battle.artist2_name}</div>
                            <div className="text-xs text-gray-500">ID: {battle.battle_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          battle.status === 'Active' 
                            ? 'bg-wave-success/10 text-wave-success border border-wave-success/20' 
                            : 'bg-gray-700/50 text-gray-400'
                        }`}>
                          {battle.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono text-gray-300">
                        {totalPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ◎
                      </td>
                      <td className="py-4 text-right font-mono text-gray-400">
                        ${(totalPool * SOL_PRICE_USD).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Live Feed Section */}
          <div className="mt-8 pt-6 border-t border-wave-800">
            <div className="flex items-center gap-2 mb-4 text-wave-accent">
                <span className="animate-pulse relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wave-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-wave-accent"></span>
                </span>
                <h3 className="font-bold text-sm uppercase tracking-wider">Live Chain Activity (Helius)</h3>
            </div>
            <div className="space-y-2">
                {liveTx.length > 0 ? liveTx.map((tx) => (
                    <div key={tx.signature} className="flex items-center justify-between text-xs bg-wave-950 p-2 rounded border border-wave-800/50">
                        <div className="flex items-center gap-2">
                            <ZapIcon />
                            <span className="text-gray-300 font-mono">{tx.signature.slice(0,8)}...{tx.signature.slice(-8)}</span>
                            <span className="text-gray-500">{tx.description}</span>
                        </div>
                        <span className="text-gray-600">{new Date(tx.timestamp * 1000).toLocaleTimeString()}</span>
                    </div>
                )) : (
                    <div className="text-xs text-gray-600 italic">Connecting to Helius RPC...</div>
                )}
            </div>
          </div>
        </div>

        {/* Top Artists */}
        <div className="bg-wave-900 border border-wave-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Earners</h2>
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-wave-800/30 border border-wave-800 hover:border-wave-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-wave-700 flex items-center justify-center font-bold text-gray-400 text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white truncate max-w-[100px]">{artist.name}</div>
                    <div className="text-xs text-gray-500">{artist.battlesParticipated} Battles</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-wave-secondary font-bold text-sm">
                    ${(artist.totalEarningsSol * SOL_PRICE_USD).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {artist.totalEarningsSol.toFixed(2)} SOL
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;