import React from 'react';
import { X, Check, Zap, Sparkles, Building2, ShieldCheck } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  onSelectPlan?: (planName: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'Free Tier',
  onSelectPlan,
}) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Tier 1: Sonic & AI Baseline',
      price: '$0',
      period: 'free forever',
      popular: false,
      description: 'Instant technical forensic check. Inspect DSP loudness, dynamics, and detect synthetic AI artifacts.',
      features: [
        'Web Audio DSP (LUFS, Peak, Crest Factor, 7-Band FFT)',
        '3-Pillar Forensic AI Artifact Audit',
        'Spotify / DistroKid Takedown Risk Check',
        'Dual Tempo (Pulse & Trap Grid) & Tonality Mode',
        'Overall Drip Score & Verdict',
      ],
      buttonLabel: 'Active Plan',
      buttonStyle: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    },
    {
      name: 'Tier 2: Pro A&R & Musicality',
      price: '$19.99',
      period: 'per month (or $4.99/track)',
      popular: true,
      description: 'Deep musicality critique for releasing artists, beatmakers, and songwriters seeking commercial ears.',
      features: [
        'Everything in Tier 1',
        '100-Pt Deductive Rubric (No 72-78 Clustering)',
        'Melody & Earworm Catchiness Score + Prescription',
        'Vocal Delivery, Cadence Velocity & Multi-Syllabic Rhyme',
        '808 Bassline Movement & Low-End Pocket Audit',
        '4-Persona Executive A&R Multi-Perspective Panel',
        'Interactive Waveform with Timecoded Cue Markers',
      ],
      buttonLabel: 'Unlock Tier 2 ($19.99/mo)',
      buttonStyle: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold shadow-lg shadow-cyan-500/20',
    },
    {
      name: 'Tier 3: Master Commercial & Sync',
      price: '$49.99',
      period: 'per month (or $9.99/track)',
      popular: false,
      description: 'The complete commercial licensing dossier for producers, managers, and studios ready to monetize.',
      features: [
        'Everything in Tier 1 & Tier 2',
        'Strategic Placement Path & Rollout Strategy',
        'Target Sync Media Placements (Film, TV, Sports, Games)',
        'Commercial Licensing Fee Valuation ($40 - $8,000+)',
        '1-Click Sync Pitch Email to Music Supervisors',
        '9:16 Viral TikTok/Reels Video Story Card',
        'Surgical 5-Step DAW Revision Checklist (Exact Hz/dB)',
        'Executive PDF One-Sheet Export & Text Dossier',
      ],
      buttonLabel: 'Get Master Dossier ($49.99/mo)',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" /> Commercial Plans
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Supercharge Your Music With Industry-Grade Forensics
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Save thousands on mixing feedback. Verify human authenticity and optimize tracks for streaming algorithms.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between border relative transition-all ${
                p.popular
                  ? 'bg-zinc-950 border-cyan-500/80 shadow-2xl shadow-cyan-500/10 scale-[1.02]'
                  : 'bg-zinc-950/60 border-zinc-800'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-white">{p.price}</span>
                  <span className="text-xs text-zinc-500">/{p.period}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{p.description}</p>

                <div className="border-t border-zinc-800/80 my-4" />

                <ul className="space-y-2 text-xs text-zinc-300">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onSelectPlan) onSelectPlan(p.name);
                  onClose();
                }}
                className={`w-full mt-6 py-2.5 rounded-xl text-xs transition-colors ${p.buttonStyle}`}
              >
                {p.buttonLabel}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center border-t border-zinc-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <span>🔒 256-bit Secure Checkout (Stripe & Apple Pay ready)</span>
          <span>Cancel anytime • 100% Satisfaction Guarantee</span>
        </div>
      </div>
    </div>
  );
};
