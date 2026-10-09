import React, { useState } from 'react';
import { X, Copy, Check, Film, Mail } from 'lucide-react';
import { DripCheckResult } from '../lib/types';

interface SyncPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DripCheckResult;
}

export const SyncPitchModal: React.FC<SyncPitchModalProps> = ({ isOpen, onClose, result }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subject = result.syncPitchTemplate?.emailSubject || `[Sync Pitch] "${result.title}" - ${result.genre} (${result.bpm} BPM)`;
  const body = result.syncPitchTemplate?.emailBody || `Hi [Music Supervisor Name],

I hope this finds you well. I wanted to share a new track that might fit your upcoming film, TV, or commercial projects.

Track Title: ${result.title}
Artist/Producer: ${result.artist || 'Independent'}
Genre: ${result.genre} (${result.bpm} BPM, Key: ${result.keySignature || 'Standard'})
Drip Score: ${result.dripScore}/100 (Hit Song Science Audited)

Soundalikes: ${result.commercialPotential?.soundalikes?.join(', ') || 'Modern Chart Hit'}
Ideal Placements: ${result.executivePanels?.syncSupervisor?.idealMediaPlacements?.join(', ') || 'Trailer, High-Intensity montage'}

Master & Publishing: 100% Cleared / One-Stop
Instrumental and Vocal Stems are prepped and available immediately upon request.

Listen here: [Insert Stream Link]

Best regards,
[Your Name / Contact Info]`;

  const fullPitch = `Subject: ${subject}\n\n${body}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-zinc-100 text-base">Sync Licensing Email Pitch Generator</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          Ready-to-send pitch email template tailored for music supervisors, sync agencies, and trailer houses.
        </p>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-3 max-h-80 overflow-y-auto leading-relaxed select-all">
          <div className="border-b border-zinc-800/80 pb-2">
            <span className="text-zinc-500">Subject: </span>
            <span className="text-emerald-400 font-semibold">{subject}</span>
          </div>
          <div className="whitespace-pre-line text-zinc-300">
            {body}
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-400">
            Est. Non-Exclusive Sync Value: <span className="text-emerald-400 font-mono font-bold">{result.commercialPotential?.suggestedLicenseFee?.syncFee || '$2,500 - $8,000'}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Full Email Pitch'}
          </button>
        </div>
      </div>
    </div>
  );
};
