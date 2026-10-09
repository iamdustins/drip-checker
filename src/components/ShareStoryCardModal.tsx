import React, { useRef } from 'react';
import { X, Download, Share2, Sparkles, Award } from 'lucide-react';
import { DripCheckResult } from '../lib/types';

interface ShareStoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DripCheckResult;
}

export const ShareStoryCardModal: React.FC<ShareStoryCardModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    // Printable / screenshot trigger
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Share2 className="w-4 h-4" /> Viral Story Card (9:16)
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Story Card Container */}
        <div
          ref={cardRef}
          className="w-full aspect-[9/16] bg-gradient-to-b from-zinc-950 via-zinc-900 to-cyan-950/80 border-2 border-cyan-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center"
        >
          {/* Neon Glow accents */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">
              A&R FORENSIC AUDIT
            </div>
            <div className="text-lg font-black text-white truncate px-2">{result.title}</div>
            <div className="text-xs text-cyan-400 font-medium">{result.artist || 'Independent Artist'} • {result.genre}</div>
          </div>

          {/* Big Score Dial */}
          <div className="my-auto py-2">
            <div className="w-36 h-36 mx-auto rounded-full border-4 border-cyan-400/80 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)] bg-zinc-950/80 backdrop-blur-sm">
              <span className="text-5xl font-black font-mono text-white tracking-tight">
                {result.dripScore}
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-400 mt-1">
                DRIP SCORE
              </span>
            </div>

            <div className="mt-4 px-3">
              <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold inline-block">
                {result.forensicAiAudit?.status || 'Certified Organic'}
              </span>
              <p className="text-xs text-zinc-300 italic mt-3 line-clamp-3 leading-relaxed">
                "{result.verdict}"
              </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-3 border-t border-zinc-800/80">
            <div className="flex justify-around text-[10px] text-zinc-400 font-mono mb-2">
              <div>BPM: <span className="text-white font-bold">{result.bpm}</span></div>
              <div>VIRALITY: <span className="text-cyan-400 font-bold">{result.scores?.viralityPotential || 85}%</span></div>
              <div>HUMAN: <span className="text-emerald-400 font-bold">{result.forensicAiAudit?.humanScore || 95}%</span></div>
            </div>
            <div className="text-[9px] font-bold tracking-widest uppercase text-zinc-500">
              AUDITED ON DRIPCHECK PRO
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="w-full mt-4 flex gap-2">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" /> Save / Print Story Card
          </button>
        </div>
      </div>
    </div>
  );
};
