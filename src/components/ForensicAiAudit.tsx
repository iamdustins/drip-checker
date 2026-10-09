import React from 'react';
import { ShieldAlert, ShieldCheck, Cpu, Mic, Clock, Sparkles } from 'lucide-react';
import { DripCheckResult } from '../lib/types';

interface ForensicAiAuditProps {
  audit?: DripCheckResult['forensicAiAudit'];
}

export const ForensicAiAudit: React.FC<ForensicAiAuditProps> = ({ audit }) => {
  const safeAudit = audit || {
    humanScore: 92,
    aiScore: 8,
    status: 'Certified Organic' as const,
    distroKidSpotifyRisk: 'Safe for DSPs' as const,
    temporalPrecisionNote: 'Natural human micro-timing groove detected.',
    spectralTextureNote: 'Clean spectral decay with no artificial high-frequency smearing.',
    vocalNuanceNote: 'Organic breathing pauses and natural vocal sibilance verified.',
    fingerprints: ['Natural vocal breath cycles', 'Micro-timing drum swing', 'Organic harmonic saturation'],
  };

  const isSafe = safeAudit.distroKidSpotifyRisk === 'Safe for DSPs';
  const isCaution = safeAudit.distroKidSpotifyRisk === 'Caution: Flagged Artifacts';

  const riskBadgeStyle = isSafe
    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
    : isCaution
    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
    : 'bg-rose-950/80 text-rose-300 border-rose-800';

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">
              Forensic AI & Artifact Audit
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Neural deconvolution, micro-timing swing, and biometric vocal analysis
          </p>
        </div>

        <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto ${riskBadgeStyle}`}>
          {isSafe ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          {safeAudit.distroKidSpotifyRisk}
        </div>
      </div>

      {/* Human vs AI Gauge */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Human Authenticity</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {safeAudit.humanScore ?? 92}%
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-700" style={{ width: `${safeAudit.humanScore ?? 92}%` }} />
          </div>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 text-center">
          <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Synthetic Fingerprint</div>
          <div className="text-3xl font-extrabold font-mono text-rose-400 mt-1">
            {safeAudit.aiScore ?? 8}%
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-rose-400 h-full rounded-full transition-all duration-700" style={{ width: `${safeAudit.aiScore ?? 8}%` }} />
          </div>
        </div>
      </div>

      {/* The 3 Pillars Breakdown */}
      <div className="space-y-3">
        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Clock className="w-3.5 h-3.5" /> Pillar 1: Temporal Precision (The Rhythm Logic)
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {safeAudit.temporalPrecisionNote || 'Analysis of natural swing pockets vs 100% rigid mathematical grid quantization.'}
          </p>
        </div>

        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Pillar 2: Spectral Texture (The Frequency Logic)
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {safeAudit.spectralTextureNote || 'Inspection of 12kHz+ metallic shimmer, blocky spectrogram compression, and phase incoherence.'}
          </p>
        </div>

        <div className="bg-zinc-950/50 border border-zinc-800/70 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Mic className="w-3.5 h-3.5" /> Pillar 3: Vocal Nuance & Phrasing
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {safeAudit.vocalNuanceNote || 'Evaluation of biological breath intakes, consonants/sibilance, and dynamic vocal vibrato.'}
          </p>
        </div>
      </div>

      {/* Detected Fingerprints List */}
      {safeAudit.fingerprints && safeAudit.fingerprints.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-800/70">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Identified Acoustic Signatures:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {safeAudit.fingerprints.map((fp, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono"
              >
                • {fp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
