import React from 'react';
import { Activity, Sliders, Volume2, Waves, Radio } from 'lucide-react';
import { AudioDspMetrics } from '../lib/types';

interface DspMetricsCardProps {
  dsp: AudioDspMetrics;
}

export const DspMetricsCard: React.FC<DspMetricsCardProps> = ({ dsp }) => {
  // Helpers
  const getLufsStatus = (lufs: number) => {
    if (lufs > -7.5) return { label: 'Extremely Loud (Squashed)', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
    if (lufs >= -11.5) return { label: 'Modern Club / DSP Master', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    if (lufs >= -15.0) return { label: 'Spotify Streaming Target', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' };
    return { label: 'Dynamic / Quiet Master', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
  };

  const getPeakStatus = (peak: number) => {
    if (peak > -0.1) return { label: 'Intersample Peak Risk', color: 'text-rose-400' };
    if (peak > -1.0) return { label: 'Optimized Ceiling', color: 'text-emerald-400' };
    return { label: 'Ample Headroom', color: 'text-cyan-400' };
  };

  const lufsStatus = getLufsStatus(dsp.estimatedLufs);
  const peakStatus = getPeakStatus(dsp.peakDbfs);

  const bands = [
    { name: 'Sub (20-60Hz)', val: dsp.frequencyBands.subBass, color: 'bg-indigo-500' },
    { name: 'Bass (60-250Hz)', val: dsp.frequencyBands.bass, color: 'bg-cyan-500' },
    { name: 'Low-Mid (250-500Hz)', val: dsp.frequencyBands.lowMids, color: 'bg-amber-500', note: 'Mud Zone' },
    { name: 'Mid (500-2kHz)', val: dsp.frequencyBands.midrange, color: 'bg-emerald-500' },
    { name: 'High-Mid (2-4kHz)', val: dsp.frequencyBands.highMids, color: 'bg-sky-500', note: 'Bite' },
    { name: 'Presence (4-6kHz)', val: dsp.frequencyBands.presence, color: 'bg-purple-500', note: 'Sibilance' },
    { name: 'Air (6-20kHz)', val: dsp.frequencyBands.brilliance, color: 'bg-pink-500' },
  ];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">
            Web Audio Forensic DSP
          </h3>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
          44.1kHz • 32-bit Float Engine
        </span>
      </div>

      {/* 4 Core Meters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3">
          <div className="text-[11px] text-zinc-400 font-medium">Estimated LUFS</div>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
            {dsp.estimatedLufs} <span className="text-xs text-zinc-500">LUFS</span>
          </div>
          <div className={`text-[10px] mt-1 px-1.5 py-0.5 rounded border inline-block ${lufsStatus.color}`}>
            {lufsStatus.label}
          </div>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3">
          <div className="text-[11px] text-zinc-400 font-medium">True Peak</div>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
            {dsp.peakDbfs} <span className="text-xs text-zinc-500">dBFS</span>
          </div>
          <div className={`text-[10px] mt-1 font-medium ${peakStatus.color}`}>
            {peakStatus.label}
          </div>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3">
          <div className="text-[11px] text-zinc-400 font-medium">Dynamic Range (Crest)</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
            {dsp.dynamicRangeDb} <span className="text-xs text-zinc-500">dB</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {dsp.dynamicRangeDb >= 11 ? 'Punchy Transients' : 'Heavy Bus Limiting'}
          </div>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3">
          <div className="text-[11px] text-zinc-400 font-medium">Stereo Phase Correlation</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            {dsp.stereoCorrelation > 0 ? `+${dsp.stereoCorrelation}` : dsp.stereoCorrelation}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {dsp.stereoCorrelation >= 0.7 ? 'Mono Compatible' : 'Check Phase Cancellation'}
          </div>
        </div>
      </div>

      {/* Frequency Spectrum Distribution */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-medium flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> 7-Band Frequency Distribution
          </span>
          <span className="text-[11px] text-zinc-500">FFT Octave Integration</span>
        </div>

        <div className="space-y-2">
          {bands.map((b, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-mono text-[11px] flex items-center gap-1.5">
                  {b.name}
                  {b.note && (
                    <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 font-sans">
                      {b.note}
                    </span>
                  )}
                </span>
                <span className="text-zinc-400 font-mono text-[11px]">{b.val}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/60">
                <div
                  className={`h-full ${b.color} transition-all duration-700 rounded-full`}
                  style={{ width: `${Math.min(100, b.val * 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Micro-timing / Grid Drift */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div>
          <span className="text-zinc-300 font-medium">Micro-Timing Grid Variance: </span>
          <span className="font-mono text-cyan-400">{dsp.temporalVariance.gridDeviationMs}ms</span>
        </div>
        <div>
          <span className="text-zinc-300 font-medium">Quantization Rigidity: </span>
          <span className="font-mono text-amber-400">{dsp.temporalVariance.quantizationScore}%</span>
        </div>
      </div>
    </div>
  );
};
