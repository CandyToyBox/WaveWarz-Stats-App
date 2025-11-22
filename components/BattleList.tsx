import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/statsService';
import { EventGroup } from '../types';
import { SOL_PRICE_USD } from '../constants';

const BattleList: React.FC = () => {
  const [events, setEvents] = useState<EventGroup[]>([]);
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    setEvents(getEvents(showTest));
  }, [showTest]);

  return (
    <div className="bg-wave-900 border border-wave-800 rounded-xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">All Events</h2>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
             <label className="flex items-center cursor-pointer">
               <div className="relative">
                 <input type="checkbox" className="sr-only" checked={showTest} onChange={() => setShowTest(!showTest)} />
                 <div className={`block w-10 h-6 rounded-full ${showTest ? 'bg-wave-accent' : 'bg-wave-700'}`}></div>
                 <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${showTest ? 'transform translate-x-4' : ''}`}></div>
               </div>
               <div className="ml-3 text-gray-400 text-sm font-medium">
                 Show Test Battles (Zaal/Joov)
               </div>
             </label>
        </div>
      </div>
      
      <div className="space-y-12">
        {events.map((group) => (
           <div key={group.date} className="animate-fade-in">
             <div className="flex items-baseline gap-4 border-b border-wave-800 pb-2 mb-6">
                <h3 className="text-xl font-bold text-wave-secondary font-mono">{group.date}</h3>
                <span className="text-sm text-gray-500">Volume: {group.totalVolumeSol.toFixed(2)} SOL</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {group.battles.map((battle) => {
                const totalPool = (battle.artist1_pool + battle.artist2_pool) / 1e9;
                const volumeUsd = totalPool * SOL_PRICE_USD;
                
                return (
                    <div key={battle.id} className={`group bg-wave-800/50 border ${battle.isTest ? 'border-yellow-900/30 opacity-75' : 'border-wave-700'} rounded-xl overflow-hidden hover:border-wave-accent transition-all duration-300`}>
                    {/* Header Image Area */}
                    <div className="h-32 bg-wave-800 relative overflow-hidden">
                        <img src={battle.image_url} alt="Battle Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute top-3 right-3 flex gap-2">
                        {battle.isTest && (
                            <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-600 text-white shadow-sm">TEST</span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${
                            battle.status === 'Active' 
                                ? 'bg-wave-success text-wave-950' 
                                : 'bg-gray-600 text-gray-200'
                            }`}>
                            {battle.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Battle #{battle.battle_id}</div>
                            <h3 className="font-bold text-lg text-white group-hover:text-wave-accent transition-colors">
                            {battle.artist1_name} <span className="text-gray-500">vs</span> {battle.artist2_name}
                            </h3>
                        </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-wave-700 h-2 rounded-full mb-4 overflow-hidden flex">
                        <div 
                            className="h-full bg-wave-accent" 
                            style={{ width: `${(battle.artist1_pool / (battle.artist1_pool + battle.artist2_pool || 1)) * 100}%` }}
                        ></div>
                        <div 
                            className="h-full bg-wave-secondary" 
                            style={{ width: `${(battle.artist2_pool / (battle.artist1_pool + battle.artist2_pool || 1)) * 100}%` }}
                        ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-xs text-gray-500">Total Volume</div>
                            <div className="font-mono text-white font-medium">{totalPool.toFixed(2)} SOL</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Est. Value</div>
                            <div className="font-mono text-white font-medium">${volumeUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                        </div>

                        <div className="pt-4 border-t border-wave-700 flex justify-between items-center">
                        <a 
                            href={`https://solscan.io/account/${battle.battle_id}?cluster=mainnet`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            View On-Chain ↗
                        </a>
                        {battle.stream_link && (
                            <a 
                            href={battle.stream_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-wave-secondary hover:text-white flex items-center gap-1"
                            >
                            Watch Stream ↗
                            </a>
                        )}
                        </div>
                    </div>
                    </div>
                );
                })}
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default BattleList;