import React from 'react';
import { RiskLevel } from '../../types';
import { Shield, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface Props {
  score: number;
  level?: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskScoreBadge: React.FC<Props> = ({ score, level, size = 'md', showLabel = true }) => {
  let computedLevel: RiskLevel = level || 'SAFE';
  if (!level) {
    if (score >= 81) computedLevel = 'CRITICAL';
    else if (score >= 61) computedLevel = 'HIGH';
    else if (score >= 31) computedLevel = 'MODERATE';
    else computedLevel = 'SAFE';
  }

  const getConfig = () => {
    switch (computedLevel) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400',
          badgeBg: 'bg-red-600 text-white',
          icon: AlertOctagon,
          label: 'CRITICAL RISK',
          ring: 'ring-2 ring-red-500/40 animate-pulse',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-400',
          badgeBg: 'bg-orange-500 text-white',
          icon: AlertTriangle,
          label: 'HIGH RISK',
          ring: 'ring-1 ring-orange-500/30',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400',
          badgeBg: 'bg-amber-500 text-white',
          icon: AlertTriangle,
          label: 'MODERATE',
          ring: 'ring-1 ring-amber-500/20',
        };
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
          badgeBg: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
          label: 'SAFE',
          ring: 'ring-1 ring-emerald-500/20',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.ring}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{score}/100</span>
        {showLabel && <span>({config.label})</span>}
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-2xl border ${config.bg} ${config.ring} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${config.badgeBg}`}>
            {score}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-base tracking-wide">
              <Icon className="w-5 h-5" />
              <span>{config.label}</span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">Live AI Stampede Risk Score</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black">{score}<span className="text-sm font-normal text-slate-500 dark:text-slate-400">/100</span></span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${config.bg} ${config.ring}`}>
      <Icon className="w-4 h-4" />
      <span>Risk Score: {score}/100</span>
      {showLabel && <span className="opacity-90">• {config.label}</span>}
    </div>
  );
};
