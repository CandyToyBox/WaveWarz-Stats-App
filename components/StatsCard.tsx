import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, trend, trendValue }) => {
  return (
    <div className="bg-wave-800 border border-wave-700 rounded-xl p-6 shadow-lg hover:border-wave-accent/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-wave-accent">{icon}</div>}
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-white font-mono">{value}</span>
        {subValue && <span className="text-sm text-gray-500 mt-1">{subValue}</span>}
      </div>
      {trend && trendValue && (
        <div className={`mt-4 flex items-center text-sm ${trend === 'up' ? 'text-wave-success' : 'text-red-400'}`}>
          <span>{trend === 'up' ? '↑' : '↓'} {trendValue}</span>
          <span className="text-gray-500 ml-2">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;