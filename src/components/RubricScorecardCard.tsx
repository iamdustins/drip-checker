import React from 'react';
import {
  Scale,
  Sliders,
  Music2,
  Mic2,
  Disc3,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { RubricScorecard } from '../lib/types';

interface RubricScorecardCardProps {
  rubric?: RubricScorecard;
  dripScore: number;
}

export const RubricScorecardCard: React.FC<RubricScorecardCardProps> = ({ rubric, dripScore }) => {
  if (!rubric) return null;

  const { pillars, totalCalculatedScore, scoreTierTitle, calibrationNotes } = rubric;

  const pillarCards = [
    {
      key: 'sonicAndMix',
      title: '1. Sonic Balance & Mix Headroom',
      data: pillars.sonicAndMix,
      icon: Sliders,
      accentColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40',
      borderColor: 'border-cyan-800/60',
      badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    {
      key: 'melodyAndEarworm',
      title: '2. Melodic Hook & Earworm Architecture',
      data: pillars.melodyAndEarworm,
      icon: Music2,
      accentColor: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-800/60',
      badgeBg: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      key: 'vocalAndLyricism',
      title: '3. Vocal Delivery, Cadence & Lyricism',
      data: pillars.vocalAndLyricism,
      icon: Mic2,
      accentColor: 'text-violet-400',
      bgColor: 'bg-violet-950/40',
      borderColor: 'border-violet-800/60',
      badgeBg: 'bg-violet-950 text-violet-300 border-violet-800',
    },
    {
      key: 'rhythmAndBassPocket',
      title: '4. Rhythm & 808 Groove Foundation',
      data: pillars.rhythmAndBassPocket,
      icon: Disc3,
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-800/60',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
  ];

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white tracking-tight">
              100-Point Deductive Forensic Grading Rubric
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Audited by the 3-Juror Deliberation Council • Explicit deductions applied from 100-pt baseline (No 72-78 clustering)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Calculated Score:</span>
            <span className="text-base font-mono font-black text-cyan-400">{totalCalculatedScore || dripScore}</span>
            <span className="text-xs text-zinc-500 font-mono">/100</span>
          </div>

          <span className="text-[11px] px-3 py-1.5 rounded-xl bg-zinc-800/90 text-zinc-200 border border-zinc-700 font-semibold font-mono">
            {scoreTierTitle}
          </span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pillarCards.map((p) => {
          const IconComponent = p.icon;
          const score = p.data?.score ?? 20;
          const maxScore = p.data?.maxScore ?? 25;
          const grade = p.data?.grade ?? 'B';
          const deductions = p.data?.deductions || [];

          return (
            <div
              key={p.key}
              className={`rounded-2xl border ${p.borderColor} ${p.bgColor} p-5 flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${p.accentColor}`}>
                    <IconComponent className="w-4 h-4" /> {p.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded border ${p.badgeBg}`}>
                      {score}/{maxScore} pts
                    </span>
                    <span className="text-[11px] font-mono font-black px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                      {grade}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                  {p.data?.summary}
                </p>

                {/* Deductions Breakdown */}
                {deductions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Itemized Deduction Penalties:
                    </span>
                    {deductions.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="text-zinc-300 text-[11px] leading-snug">
                            <strong className="text-zinc-200">{d.category}:</strong> {d.description}
                          </span>
                        </div>
                        <span className="text-rose-400 font-mono font-bold text-[11px] shrink-0">
                          {d.points > 0 ? `-${d.points}` : d.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar for Pillar */}
              <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-indigo-500"
                  style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Deliberation Footer & Anti-Clustering Notice */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {calibrationNotes}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-cyan-400 font-mono text-[11px]">
          <Award className="w-3.5 h-3.5" />
          <span>Certified Juror Deliberation</span>
        </div>
      </div>
    </div>
  );
};
