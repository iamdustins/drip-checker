import React from 'react';
import { Award, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

interface DripScoreGaugeProps {
  score?: number;
  verdict?: string;
  genre?: string;
  bpm?: number;
  tempoInfo?: {
    pulseBpm: number;
    gridBpm: number;
    formatted: string;
  };
  keySignature?: string;
  tonalityInfo?: {
    mode?: string;
    harmonicMood?: string;
    estimatedRoot?: string;
  };
}

export const DripScoreGauge: React.FC<DripScoreGaugeProps> = ({
  score = 75,
  verdict = 'Solid production with commercial potential.',
  genre = 'Hip-Hop',
  bpm = 120,
  tempoInfo,
  keySignature = 'Auto',
  tonalityInfo,
}) => {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 75));

  // Determine color scheme based on score
  const getColor = () => {
    if (safeScore >= 88) return { stroke: '#06b6d4', text: 'text-cyan-400', badge: 'bg-cyan-950 text-cyan-300 border-cyan-800', label: 'Platinum Tier' };
    if (safeScore >= 78) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800', label: 'Hit Potential' };
    if (safeScore >= 65) return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'bg-amber-950 text-amber-300 border-amber-800', label: 'Commercial Contender' };
    return { stroke: '#f43f5e', text: 'text-rose-400', badge: 'bg-rose-950 text-rose-300 border-rose-800', label: 'Needs Polish' };
  };

  const scheme = getColor();
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const displayTempo = tempoInfo?.formatted || `${bpm} BPM`;
  const displayTonality = tonalityInfo?.harmonicMood || tonalityInfo?.mode || keySignature || 'Minor Tonality';

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 ${scheme.text}`} />
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Overall Rating</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${scheme.badge}`}>
            {scheme.label}
          </span>
        </div>

        {/* Circular Dial */}
        <div className="flex items-center justify-center my-3 relative">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-zinc-800/80"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={scheme.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black tracking-tight text-white font-mono">{safeScore}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Drip Score</span>
          </div>
        </div>

        {/* Verdict Callout */}
        <p className="text-sm text-zinc-300 italic text-center mt-3 line-clamp-3 leading-relaxed border-t border-zinc-800/60 pt-3">
          "{verdict}"
        </p>
      </div>

      {/* Meta Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800/60 text-center">
        <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Genre</div>
          <div className="text-xs font-semibold text-zinc-200 truncate mt-0.5">{genre || 'Hip-Hop'}</div>
        </div>
        <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Tempo (Pulse / Grid)</div>
          <div className="text-xs font-semibold text-cyan-400 font-mono mt-0.5 truncate" title={displayTempo}>
            {displayTempo}
          </div>
        </div>
        <div className="bg-zinc-950/60 rounded-lg p-2 border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Tonality & Mood</div>
          <div className="text-xs font-semibold text-amber-300 font-mono mt-0.5 truncate" title={displayTonality}>
            {displayTonality}
          </div>
        </div>
      </div>
    </div>
  );
};
