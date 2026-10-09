import React from 'react';
import {
  Sparkles,
  Mic2,
  Music2,
  Radio,
  Flame,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Volume2,
  Waves,
  Zap,
} from 'lucide-react';
import { DripCheckResult } from '../lib/types';

interface ArtisticDeliveryCardProps {
  artistic?: DripCheckResult['artisticDelivery'];
}

export const ArtisticDeliveryCard: React.FC<ArtisticDeliveryCardProps> = ({ artistic }) => {
  const safeArtistic = artistic || {
    melodyAndCatchiness: {
      earwormScore: 82,
      hookPronouncement: 'Hook is distinctly separated from the verses with clear melodic contrast.',
      hookArrivalTimestamp: '0:22 (Within ideal 30s streaming window)',
      melodicCritique: 'Ascending minor pentatonic motif with strong rhythmic cadence.',
      catchinessPrescription: 'Repeat the 3-word title hook phrase twice with a call-and-response vocal adlib.',
    },
    vocalAndLyricism: {
      deliveryConvictionScore: 85,
      cadenceVelocity: 'Relaxed boom-bap pocket (10-12 syllables/bar) with rapid syncopated triplets.',
      rhymeComplexity: 'Multi-syllabic compound end-rhymes with dense mid-line internal assonance.',
      vocalFrictionAndTimbre: 'Gritty chest rasp with warm analog tape saturation.',
      lyricalThemeAndStory: 'Strong narrative imagery and concrete sensory nouns; zero generic filler.',
      vocalRoomForImprovement: 'Add stereo doubled backing vocals on bar 4 and 8 to punch the terminal rhyme words.',
    },
    rhythmAndBassline: {
      basslineScore: 80,
      basslineMovement: 'Root-note 808 slides with controlled sub-bass decay.',
      kickBassPocket: 'Kick drum and 808 lock tightly on downbeats with crisp transient attack.',
      grooveTightness: 'Natural human micro-swing on 16th-note hi-hats.',
      lowEndFix: 'Sidechain 808 slightly to kick transient and notch 280Hz to clear mid-bass mud.',
    },
  };

  const { melodyAndCatchiness: melody, vocalAndLyricism: vocals, rhythmAndBassline: bass } = safeArtistic;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background neon glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold tracking-tight text-white">
              Artistic Delivery, Lyricism & Earworm Architecture
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Deep critique on melody memorability, cadence pocket, rhyme schemes, and 808 bassline groove
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-3 py-1 rounded-full bg-amber-950/70 border border-amber-800/80 text-amber-300 font-semibold font-mono">
            ★ Tier 2 A&R Engine
          </span>
        </div>
      </div>

      {/* 3 Pillar Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Melody & Earworm Catchiness */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Music2 className="w-4 h-4" /> Melody & Earworm
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {melody.earwormScore ?? 82}% Catchy
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                <span className="text-zinc-400 font-medium block text-[11px]">Hook Arrival & Impact:</span>
                <span className="text-zinc-200 font-mono font-semibold text-xs mt-0.5 block text-cyan-400">
                  ⏱ {melody.hookArrivalTimestamp}
                </span>
                <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                  {melody.hookPronouncement}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-medium block text-[11px] mb-1">Melodic Motif Movement:</span>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  {melody.melodicCritique}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Catchiness Prescription */}
          <div className="bg-gradient-to-br from-amber-950/50 via-zinc-900 to-zinc-950 border border-amber-800/50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Prescription to Maximize Catchiness:</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed italic">
              "{melody.catchinessPrescription}"
            </p>
          </div>
        </div>

        {/* Pillar 2: Vocal Skills, Cadence & Lyricism */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Mic2 className="w-4 h-4" /> Vocal Delivery & Rhyme
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {vocals.deliveryConvictionScore ?? 85}% Conviction
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 font-medium block text-[11px]">Cadence & Syllable Pocket:</span>
                <p className="text-zinc-200 text-xs mt-0.5 leading-relaxed">
                  {vocals.cadenceVelocity}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-medium block text-[11px]">Rhyme Scheme & Multi-Syllabics:</span>
                <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
                  {vocals.rhymeComplexity}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-medium block text-[11px]">Vocal Timbre & Friction:</span>
                <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
                  {vocals.vocalFrictionAndTimbre}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-medium block text-[11px]">Storytelling & Lyrical Imagery:</span>
                <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
                  {vocals.lyricalThemeAndStory}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-cyan-900/40 rounded-xl p-3.5 text-xs">
            <span className="text-cyan-400 font-semibold flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5" /> Vocal Stacking Recommendation:
            </span>
            <p className="text-zinc-300 leading-relaxed text-xs">
              {vocals.vocalRoomForImprovement}
            </p>
          </div>
        </div>

        {/* Pillar 3: Rhythm & Bassline Pocket */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Waves className="w-4 h-4" /> 808 & Bassline Pocket
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {bass.basslineScore ?? 80}% Groove
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 font-medium block text-[11px]">808 / Bassline Movement:</span>
                <p className="text-zinc-200 text-xs mt-0.5 leading-relaxed">
                  {bass.basslineMovement}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-medium block text-[11px]">Kick & Bass Interlock:</span>
                <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
                  {bass.kickBassPocket}
                </p>
              </div>

              <div>
                <span className="text-zinc-400 font-medium block text-[11px]">Rhythmic Swing & Pocket:</span>
                <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
                  {bass.grooveTightness}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-emerald-900/40 rounded-xl p-3.5 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1 mb-1">
              <Volume2 className="w-3.5 h-3.5" /> Low-End Engineering Tweak:
            </span>
            <p className="text-zinc-300 leading-relaxed text-xs">
              {bass.lowEndFix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
