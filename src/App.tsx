import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Music,
  Zap,
  Sliders,
  Award,
  ShieldCheck,
  FileText,
  Download,
  Share2,
  Film,
  Key,
  FolderArchive,
  Loader2,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRightLeft,
  Sparkles,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Link2,
  Globe,
} from 'lucide-react';

import { DripCheckResult, AudioDspMetrics, ComparisonResult, TimecodedMarker } from './lib/types';
import { analyzeAudioDsp } from './lib/audioDsp';
import { WaveformPlayer } from './components/WaveformPlayer';
import { DripScoreGauge } from './components/DripScoreGauge';
import { DspMetricsCard } from './components/DspMetricsCard';
import { ForensicAiAudit } from './components/ForensicAiAudit';
import { ArMultiPanel } from './components/ArMultiPanel';
import { ArtisticDeliveryCard } from './components/ArtisticDeliveryCard';
import { RubricScorecardCard } from './components/RubricScorecardCard';
import { ActionPlanCard } from './components/ActionPlanCard';
import { SyncPitchModal } from './components/SyncPitchModal';
import { ShareStoryCardModal } from './components/ShareStoryCardModal';
import { PricingModal } from './components/PricingModal';
import { SettingsModal } from './components/SettingsModal';
import { LegacyReportsDrawer } from './components/LegacyReportsDrawer';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('[DripCheck Pro] Error Boundary caught render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-rose-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Workstation Recovery Notice</h2>
            <p className="text-xs text-zinc-400 mb-4">
              A render exception was caught safely. Audio and server connection remain active.
            </p>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs font-mono text-rose-300 mb-6 text-left overflow-x-auto">
              {String(this.state.error?.message || this.state.error || 'Unknown render error')}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs"
            >
              Reset & Reload Workstation
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <DripCheckWorkstation />
    </ErrorBoundary>
  );
}

function DripCheckWorkstation() {
  // Modes & State
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('dripcheck_gemini_key') || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Single Track File & Results
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dspMetrics, setDspMetrics] = useState<AudioDspMetrics | null>(null);
  const [result, setResult] = useState<DripCheckResult | null>(null);
  const [activeTier, setActiveTier] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all');

  // Single Track Link Streaming
  const [uploadTab, setUploadTab] = useState<'file' | 'link'>('file');
  const [streamUrl, setStreamUrl] = useState('');
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [linkMeta, setLinkMeta] = useState<{ title: string; artist: string; source: string } | null>(null);

  // Compare Mode Files & Results
  const [fileA, setFileA] = useState<File | null>(null);
  const [audioUrlA, setAudioUrlA] = useState<string | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [audioUrlB, setAudioUrlB] = useState<string | null>(null);
  const [refSongLink, setRefSongLink] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isResolvingRefLink, setIsResolvingRefLink] = useState(false);
  const [targetLinkB, setTargetLinkB] = useState('');
  const [isResolvingTargetLinkB, setIsResolvingTargetLinkB] = useState(false);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Pro Studio Active');

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('dripcheck_gemini_key', key);
  };

  // Reset Workstation State without refreshing page
  const handleReset = () => {
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch (_) {}
    }
    setFile(null);
    setAudioUrl(null);
    setDspMetrics(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setAnalysisStep('');
    setActiveTier('all');
    setStreamUrl('');
    setLinkMeta(null);
  };

  const handleResetCompare = () => {
    if (audioUrlA) { try { URL.revokeObjectURL(audioUrlA); } catch (_) {} }
    if (audioUrlB) { try { URL.revokeObjectURL(audioUrlB); } catch (_) {} }
    setFileA(null);
    setAudioUrlA(null);
    setFileB(null);
    setAudioUrlB(null);
    setRefSongLink('');
    setTargetLinkB('');
    setComparisonResult(null);
    setError(null);
    setIsAnalyzing(false);
    setAnalysisStep('');
  };

  // Convert File to Base64
  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  // Convert Base64 string to a File object
  const base64ToFile = (base64: string, filename: string, mimeType = 'audio/mp3'): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  };

  // Resolve Single Track Streaming Link
  const handleResolveSingleLink = async (customUrl?: string) => {
    const targetUrl = (customUrl || streamUrl).trim();
    if (!targetUrl) {
      setError('Please enter a valid link from YouTube, Spotify, SoundCloud, or Google Drive.');
      return;
    }
    setIsResolvingLink(true);
    setError(null);
    setAnalysisStep('Fetching streaming audio & resolving metadata...');

    try {
      const resp = await fetch('/api/resolve-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to extract audio from URL');
      }

      const data = await resp.json();
      setLinkMeta({
        title: data.title,
        artist: data.artist,
        source: data.source,
      });

      // Convert Base64 to File object
      const extractedFile = base64ToFile(data.audioBase64, data.fileName, data.mimeType || 'audio/mp3');
      setFile(extractedFile);
      if (audioUrl) {
        try { URL.revokeObjectURL(audioUrl); } catch (_) {}
      }
      const url = URL.createObjectURL(extractedFile);
      setAudioUrl(url);
      setResult(null);

      // Run client-side Web Audio DSP
      try {
        setAnalysisStep('Computing Web Audio FFT spectrum & LUFS from stream...');
        const dsp = await analyzeAudioDsp(extractedFile);
        setDspMetrics(dsp);
      } catch (dspErr) {
        console.warn('Web Audio DSP error on stream:', dspErr);
      }
    } catch (err: any) {
      console.error('Resolve link error:', err);
      setError(err.message || 'Unable to extract audio from streaming link. Ensure the link is public.');
    } finally {
      setIsResolvingLink(false);
      setAnalysisStep('');
    }
  };

  // Resolve Compare Track A Reference Link
  const handleResolveCompareLinkA = async (customUrl?: string) => {
    const targetUrl = (customUrl || refSongLink).trim();
    if (!targetUrl) {
      setError('Please enter a Spotify, YouTube, or audio link for Track A.');
      return;
    }
    setIsResolvingRefLink(true);
    setError(null);

    try {
      const resp = await fetch('/api/resolve-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to extract audio for Track A');
      }

      const data = await resp.json();
      const extractedFile = base64ToFile(data.audioBase64, data.fileName, data.mimeType || 'audio/mp3');
      setFileA(extractedFile);
      if (audioUrlA) { try { URL.revokeObjectURL(audioUrlA); } catch (_) {} }
      setAudioUrlA(URL.createObjectURL(extractedFile));
    } catch (err: any) {
      setError(err.message || 'Could not stream Track A.');
    } finally {
      setIsResolvingRefLink(false);
    }
  };

  // Resolve Compare Track B Target Link
  const handleResolveCompareLinkB = async (customUrl?: string) => {
    const targetUrl = (customUrl || targetLinkB).trim();
    if (!targetUrl) {
      setError('Please enter a link for Track B.');
      return;
    }
    setIsResolvingTargetLinkB(true);
    setError(null);

    try {
      const resp = await fetch('/api/resolve-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to extract audio for Track B');
      }

      const data = await resp.json();
      const extractedFile = base64ToFile(data.audioBase64, data.fileName, data.mimeType || 'audio/mp3');
      setFileB(extractedFile);
      if (audioUrlB) { try { URL.revokeObjectURL(audioUrlB); } catch (_) {} }
      setAudioUrlB(URL.createObjectURL(extractedFile));
    } catch (err: any) {
      setError(err.message || 'Could not stream Track B.');
    } finally {
      setIsResolvingTargetLinkB(false);
    }
  };

  // Handle Single File Drop
  const onDropSingle = useCallback(async (acceptedFiles: File[]) => {
    const dropped = acceptedFiles[0];
    if (!dropped) return;

    setError(null);
    setFile(dropped);
    const url = URL.createObjectURL(dropped);
    setAudioUrl(url);
    setResult(null);

    try {
      setAnalysisStep('Extracting Web Audio DSP measurements...');
      const dsp = await analyzeAudioDsp(dropped);
      setDspMetrics(dsp);
    } catch (e: any) {
      console.warn('DSP extraction fallback:', e);
    }
  }, []);

  const { getRootProps: getSingleDropProps, getInputProps: getSingleInputProps, isDragActive: isSingleDragActive } =
    useDropzone({
      onDrop: onDropSingle,
      accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'] },
      multiple: false,
    });

  // Handle Compare Drops
  const onDropA = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFileA(acceptedFiles[0]);
      setAudioUrlA(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const onDropB = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFileB(acceptedFiles[0]);
      setAudioUrlB(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const { getRootProps: getDropPropsA, getInputProps: getInputPropsA } = useDropzone({
    onDrop: onDropA,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'] },
    multiple: false,
  });

  const { getRootProps: getDropPropsB, getInputProps: getInputPropsB } = useDropzone({
    onDrop: onDropB,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'] },
    multiple: false,
  });

  // Execute Single Track Deep Audit
  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      setAnalysisStep('Encoding audio & DSP telemetry...');
      const audioBase64 = await fileToBase64(file);

      // Re-run DSP if missing
      let activeDsp = dspMetrics;
      if (!activeDsp) {
        setAnalysisStep('Computing Web Audio FFT spectrum & LUFS...');
        activeDsp = await analyzeAudioDsp(file);
        setDspMetrics(activeDsp);
      }

      setAnalysisStep('Auditing Hit Song Science & Forensic AI Artifacts...');
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey || '',
        },
        body: JSON.stringify({
          audioBase64,
          mimeType: file.type || 'audio/mp3',
          fileName: file.name,
          dspMetrics: activeDsp,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed (${resp.status})`);
      }

      setAnalysisStep('Synthesizing Executive A&R Recommendations...');
      const data = await resp.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during audio dissection.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Execute Compare Tracks
  const handleCompare = async () => {
    if (!fileB) {
      setError('Please provide at least Track B (Target Master) to compare.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep('Running comparative A/B sonic dissection...');

    try {
      const b64B = await fileToBase64(fileB);
      let b64A: string | null = null;
      if (fileA) {
        b64A = await fileToBase64(fileA);
      }

      const resp = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey || '',
        },
        body: JSON.stringify({
          trackA: b64A ? { audioBase64: b64A, mimeType: fileA?.type } : null,
          trackB: { audioBase64: b64B, mimeType: fileB.type },
          referenceLink: refSongLink,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Comparison failed');
      }

      const data = await resp.json();
      setComparisonResult(data);
    } catch (err: any) {
      setError(err.message || 'A/B comparison failed.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Download raw legacy txt report
  const downloadTxtReport = () => {
    if (!result) return;
    const timestamp = new Date().toLocaleString();
    const content = `
DRIPCHECK PRO - SONIC FORENSIC & A&R AUDIT DOSSIER
Generated: ${timestamp}
Track: ${result.title}
Artist: ${result.artist || 'Independent'}
Genre: ${result.genre} (${result.subGenre ? result.subGenre + ', ' : ''}${result.tempoInfo?.formatted || result.bpm + ' BPM'})
Tonality & Mood: ${result.tonalityInfo?.harmonicMood || result.tonalityInfo?.mode || result.keySignature || 'Minor Tonality'}
Estimated Root: ${result.tonalityInfo?.estimatedRoot || result.keySignature || 'Auto'}

==================================================
OVERALL DRIP SCORE: ${result.dripScore}/100
CALIBRATION TIER: ${result.rubricScorecard?.scoreTierTitle || 'Certified Audit'}
VERDICT: ${result.verdict}
DISTROKID/SPOTIFY RISK: ${result.forensicAiAudit?.distroKidSpotifyRisk || 'Safe for DSPs'}
==================================================

1. 100-POINT DEDUCTIVE RUBRIC AUDIT
- Baseline: 100 Points
- Pillar 1 (Sonic Balance & Mix Headroom): ${result.rubricScorecard?.pillars?.sonicAndMix?.score ?? 'N/A'}/25 pts [Grade: ${result.rubricScorecard?.pillars?.sonicAndMix?.grade ?? 'B'}]
  Summary: ${result.rubricScorecard?.pillars?.sonicAndMix?.summary}
  Deductions: ${result.rubricScorecard?.pillars?.sonicAndMix?.deductions?.map(d => `${d.category} (${d.points}pts): ${d.description}`).join('; ') || 'None'}

- Pillar 2 (Melodic Hook & Earworm Architecture): ${result.rubricScorecard?.pillars?.melodyAndEarworm?.score ?? 'N/A'}/25 pts [Grade: ${result.rubricScorecard?.pillars?.melodyAndEarworm?.grade ?? 'B'}]
  Summary: ${result.rubricScorecard?.pillars?.melodyAndEarworm?.summary}
  Deductions: ${result.rubricScorecard?.pillars?.melodyAndEarworm?.deductions?.map(d => `${d.category} (${d.points}pts): ${d.description}`).join('; ') || 'None'}

- Pillar 3 (Vocal Delivery, Cadence & Lyricism): ${result.rubricScorecard?.pillars?.vocalAndLyricism?.score ?? 'N/A'}/25 pts [Grade: ${result.rubricScorecard?.pillars?.vocalAndLyricism?.grade ?? 'B'}]
  Summary: ${result.rubricScorecard?.pillars?.vocalAndLyricism?.summary}
  Deductions: ${result.rubricScorecard?.pillars?.vocalAndLyricism?.deductions?.map(d => `${d.category} (${d.points}pts): ${d.description}`).join('; ') || 'None'}

- Pillar 4 (Rhythm & 808 Groove Foundation): ${result.rubricScorecard?.pillars?.rhythmAndBassPocket?.score ?? 'N/A'}/25 pts [Grade: ${result.rubricScorecard?.pillars?.rhythmAndBassPocket?.grade ?? 'B'}]
  Summary: ${result.rubricScorecard?.pillars?.rhythmAndBassPocket?.summary}
  Deductions: ${result.rubricScorecard?.pillars?.rhythmAndBassPocket?.deductions?.map(d => `${d.category} (${d.points}pts): ${d.description}`).join('; ') || 'None'}

2. ARTISTIC DELIVERY & EARWORM PSYCHOLOGY
- Earworm Catchiness Score: ${result.artisticDelivery?.melodyAndCatchiness?.earwormScore}%
- Hook Arrival Window: ${result.artisticDelivery?.melodyAndCatchiness?.hookArrivalTimestamp}
- Hook Pronouncement: ${result.artisticDelivery?.melodyAndCatchiness?.hookPronouncement}
- Catchiness Prescription: "${result.artisticDelivery?.melodyAndCatchiness?.catchinessPrescription}"
- Cadence Velocity: ${result.artisticDelivery?.vocalAndLyricism?.cadenceVelocity}
- Rhyme Architecture: ${result.artisticDelivery?.vocalAndLyricism?.rhymeComplexity}
- Vocal Timbre & Friction: ${result.artisticDelivery?.vocalAndLyricism?.vocalFrictionAndTimbre}
- Vocal Room for Improvement: ${result.artisticDelivery?.vocalAndLyricism?.vocalRoomForImprovement}
- 808 Bassline Movement: ${result.artisticDelivery?.rhythmAndBassline?.basslineMovement}
- Low-End Production Fix: ${result.artisticDelivery?.rhythmAndBassline?.lowEndFix}

3. COMMERCIAL POTENTIAL & LICENSING VALUATION
- Strategic Placement Path: ${result.recommendation?.path}
- Market Fit: ${result.commercialPotential?.marketFit}
- Non-Exclusive Beat License: ${result.commercialPotential?.suggestedLicenseFee?.nonExclusive}
- Exclusive Master License: ${result.commercialPotential?.suggestedLicenseFee?.exclusive}
- Film/TV Sync License Fee: ${result.commercialPotential?.suggestedLicenseFee?.syncFee}
- Soundalikes: ${result.commercialPotential?.soundalikes?.join(', ')}
- Rollout Strategy: ${result.recommendation?.rolloutStrategy}

4. WEB AUDIO FORENSIC DSP READINGS
- Estimated LUFS: ${dspMetrics?.estimatedLufs ?? 'N/A'} LUFS
- True Peak: ${dspMetrics?.peakDbfs ?? 'N/A'} dBFS
- Dynamic Range: ${dspMetrics?.dynamicRangeDb ?? 'N/A'} dB
- Stereo Phase Correlation: ${dspMetrics?.stereoCorrelation ?? 'N/A'}
- Micro-Timing Deviation: ${dspMetrics?.temporalVariance?.gridDeviationMs ?? 'N/A'}ms

5. FORENSIC AI AUDIT (3 PILLARS)
- Human Authenticity Score: ${result.forensicAiAudit?.humanScore}%
- Synthetic Fingerprint Score: ${result.forensicAiAudit?.aiScore}%
- Temporal Precision: ${result.forensicAiAudit?.temporalPrecisionNote}
- Spectral Texture: ${result.forensicAiAudit?.spectralTextureNote}
- Vocal Nuance: ${result.forensicAiAudit?.vocalNuanceNote}

6. SURGICAL MIXING & MASTERING ACTION PLAN
${result.actionPlan?.map(a => `[${a.priority}] ${a.target}: ${a.action}`).join('\n')}

Audited via DripCheck Pro Multi-Agent Workstation
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DripCheck_Audit_${result.title.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-zinc-950 fill-zinc-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                DRIPCHECK <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-800 rounded">PRO v2</span>
              </h1>
            </div>
            <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold hidden sm:block">
              Forensic Audio Intelligence & Commercial A&R Workstation
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'single'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Single Track Audit
          </button>
          <button
            onClick={() => setMode('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'compare'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> A/B Hit Matcher
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {(file || result || fileA || fileB || comparisonResult) && (
            <button
              onClick={mode === 'single' ? handleReset : handleResetCompare}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors text-xs flex items-center gap-1.5"
              title="Reset Workstation without page reload"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline text-xs font-semibold">Reset</span>
            </button>
          )}

          <button
            onClick={() => setShowArchive(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors text-xs flex items-center gap-1.5"
            title="Past Reports Archive"
          >
            <FolderArchive className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Past Reports</span>
          </button>

          <button
            onClick={() => setShowPricing(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-zinc-950 font-bold text-xs hover:opacity-95 transition-opacity shadow-lg shadow-cyan-500/10 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monetization / Plans</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="Settings & API Key"
          >
            <Key className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/70 border border-rose-800 rounded-2xl p-4 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ================= MODE: SINGLE TRACK AUDIT ================= */}
        {mode === 'single' && (
          <div className="space-y-6">
            {/* Input Method Switcher (When no track is loaded yet) */}
            {!result && !file && (
              <div className="flex justify-center mb-2">
                <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-1.5 flex items-center gap-1.5 w-full max-w-md shadow-xl backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setUploadTab('file')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      uploadTab === 'file'
                        ? 'bg-cyan-500 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadTab('link')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      uploadTab === 'link'
                        ? 'bg-cyan-500 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Paste Streaming Link</span>
                  </button>
                </div>
              </div>
            )}

            {/* File Dropzone Area (When uploadTab === 'file' and no track loaded) */}
            {!result && !file && uploadTab === 'file' && (
              <div
                {...getSingleDropProps()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isSingleDragActive
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                }`}
              >
                <input {...getSingleInputProps()} />
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-xl">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                    Drag & Drop Your Audio Track Here
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-3">
                    Supports MP3, WAV, M4A, OGG, and FLAC (Up to 50MB). Web Audio DSP runs instantly in your browser.
                  </p>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-mono inline-block">
                    Free Scan Available • Ready For Commercial Audit
                  </span>
                </div>
              </div>
            )}

            {/* Streaming & Cloud Link Input Card (When uploadTab === 'link' and no track loaded) */}
            {!result && !file && uploadTab === 'link' && (
              <div className="border border-zinc-800 bg-zinc-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-cyan-400 shadow-xl">
                    <Globe className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      Stream Audio from Online & Cloud Links
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
                      Paste a public link from <strong className="text-zinc-200">YouTube, Spotify, SoundCloud, YouTube Music</strong>, or <strong className="text-zinc-200">Google Drive</strong>. We extract high-fidelity studio audio, run Web Audio DSP in your browser, and deliver your full A&R audit.
                    </p>
                  </div>

                  {/* Link Input Row */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Link2 className="w-4 h-4 text-cyan-400" />
                      </div>
                      <input
                        type="url"
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isResolvingLink && streamUrl.trim()) {
                            handleResolveSingleLink();
                          }
                        }}
                        placeholder="Paste YouTube, Spotify, SoundCloud, or Google Drive link..."
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResolveSingleLink()}
                      disabled={isResolvingLink || !streamUrl.trim()}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      {isResolvingLink ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Extracting Audio...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Fetch & Dissect</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Platform Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Supported Platforms:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-red-900/60 text-red-400 font-mono text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> YouTube
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-rose-900/60 text-rose-400 font-mono text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> YT Music
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-emerald-900/60 text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Spotify
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-amber-900/60 text-amber-400 font-mono text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> SoundCloud
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-sky-900/60 text-sky-400 font-mono text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Google Drive
                    </span>
                  </div>

                  {/* One-click Demo Examples */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="text-[10px] text-zinc-500">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT';
                        setStreamUrl(url);
                        handleResolveSingleLink(url);
                      }}
                      disabled={isResolvingLink}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      ⚡ Spotify: Rick Astley
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = 'https://www.youtube.com/watch?v=DAjMZ6fCPOo';
                        setStreamUrl(url);
                        handleResolveSingleLink(url);
                      }}
                      disabled={isResolvingLink}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      ⚡ YouTube: Test Beat
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loaded Track Banner Card (When track is loaded but audit not yet triggered) */}
            {!result && file && (
              <div className="border border-zinc-800 bg-zinc-900/60 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-cyan-400 shadow-md shrink-0">
                    <Music className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-white">{linkMeta?.title || file.name}</h3>
                      {linkMeta?.source ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 border border-cyan-800 text-cyan-300">
                          {linkMeta.source}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-400">
                          Local File
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      {linkMeta?.artist ? `${linkMeta.artist} • ` : ''}{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'audio/mp3'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Choose Another Track</span>
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Action Button & Status */}
            {file && !result && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:opacity-95 text-zinc-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2 transform active:scale-95"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{analysisStep || 'Auditing Audio...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 fill-current" />
                        <span>RUN DEEP FORENSIC & A&R AUDIT</span>
                      </>
                    )}
                  </button>

                  {!isAnalyzing && (
                    <button
                      onClick={handleReset}
                      className="px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-all border border-zinc-800 flex items-center gap-2 shadow-md"
                      title="Clear loaded audio and choose another track"
                    >
                      <RotateCcw className="w-4 h-4 text-cyan-400" />
                      <span>Clear Track</span>
                    </button>
                  )}
                </div>
                {isAnalyzing && (
                  <p className="text-xs text-zinc-400 font-mono animate-pulse">
                    Processing 44.1kHz audio stream with Gemini Multimodal + Web Audio DSP
                  </p>
                )}
              </div>
            )}

            {/* Interactive Player (Shown whenever file is loaded) */}
            {audioUrl && (
              <WaveformPlayer
                audioUrl={audioUrl}
                fileName={file?.name}
                markers={result?.timecodedNotes || []}
              />
            )}

            {/* Live Results Display */}
            {result && (
              <div className="space-y-6 pt-2">
                {/* Result Control Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <div>
                    <h2 className="text-lg font-black text-white">{result.title}</h2>
                    <p className="text-xs text-zinc-400">
                      {result.artist || 'Independent Artist'} • {result.genre} • {result.tempoInfo?.formatted || `${result.bpm} BPM`} • {result.tonalityInfo?.harmonicMood || result.keySignature || 'Minor'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-zinc-700 shadow-sm"
                      title="Clear this audit and analyze another track without refreshing the browser"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Audit New Track / Reset</span>
                    </button>

                    <button
                      onClick={() => setShowSyncModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 hover:border-emerald-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" /> Sync Pitch Email
                    </button>

                    <button
                      onClick={() => setShowStoryModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-400 hover:border-cyan-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" /> 9:16 Story Card
                    </button>

                    <button
                      onClick={downloadTxtReport}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Download .txt
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Export PDF One-Sheet
                    </button>
                  </div>
                </div>

                {/* 3-Tier View Navigation Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2 sm:p-2.5 shadow-xl">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setActiveTier('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        activeTier === 'all'
                          ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md'
                          : 'text-zinc-400 hover:text-white bg-zinc-950/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>All Tiers (Master Dossier)</span>
                    </button>

                    <button
                      onClick={() => setActiveTier('tier1')}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        activeTier === 'tier1'
                          ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
                          : 'text-zinc-400 hover:text-white bg-zinc-950/60'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Tier 1: Sonic & AI Baseline</span>
                    </button>

                    <button
                      onClick={() => setActiveTier('tier2')}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        activeTier === 'tier2'
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                          : 'text-zinc-400 hover:text-white bg-zinc-950/60'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tier 2: Pro A&R & Musicality</span>
                    </button>

                    <button
                      onClick={() => setActiveTier('tier3')}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        activeTier === 'tier3'
                          ? 'bg-indigo-500 text-white font-bold shadow-md'
                          : 'text-zinc-400 hover:text-white bg-zinc-950/60'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Tier 3: Commercial & Sync Strategy</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">
                      Viewing: <strong className="text-cyan-400">{activeTier === 'all' ? 'Complete Master Dossier' : activeTier.toUpperCase()}</strong>
                    </span>
                  </div>
                </div>

                {/* ================= TIER 1 OR ALL: SONIC & DSP BASELINE ================= */}
                {(activeTier === 'all' || activeTier === 'tier1' || activeTier === 'tier2' || activeTier === 'tier3') && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <DripScoreGauge
                        score={result.dripScore}
                        verdict={result.verdict}
                        genre={result.genre}
                        bpm={result.bpm}
                        tempoInfo={result.tempoInfo}
                        keySignature={result.keySignature}
                        tonalityInfo={result.tonalityInfo}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      {dspMetrics ? (
                        <DspMetricsCard dsp={dspMetrics} />
                      ) : (
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 text-center text-xs text-zinc-500">
                          DSP Metrics loading...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= TIER 2 OR ALL: RUBRIC & ARTISTIC DELIVERY ================= */}
                {(activeTier === 'all' || activeTier === 'tier2' || activeTier === 'tier3') && (
                  <>
                    {/* 100-Point Deductive Rubric Breakdown */}
                    <RubricScorecardCard
                      rubric={result.rubricScorecard}
                      dripScore={result.dripScore}
                    />

                    {/* Deep Artistic Delivery: Melody Catchiness, Vocal Skills, 808 Pocket */}
                    <ArtisticDeliveryCard artistic={result.artisticDelivery} />

                    {/* 4-Persona Executive A&R Multi-Perspective Panel */}
                    <ArMultiPanel
                      panels={result.executivePanels}
                      commercial={result.commercialPotential}
                    />
                  </>
                )}

                {/* ================= TIER 1 SPECIFIC VIEW: FORENSIC AUDIT ONLY ================= */}
                {activeTier === 'tier1' && (
                  <div className="space-y-6">
                    <ForensicAiAudit audit={result.forensicAiAudit} />

                    {/* Tier 2 Upgrade Prompt Banner */}
                    <div className="bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-950 border border-amber-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span>Unlock Tier 2: Pro A&R & Musicality Analysis</span>
                        </div>
                        <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                          Get the 100-Point Deductive Rubric, Melody Earworm Catchiness Score & Prescription, Vocal Cadence Velocity, Multi-Syllabic Rhyme Scheme, 808 Bassline Pocket, and 4-Executive Panel.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTier('tier2')}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shrink-0 shadow-lg"
                      >
                        Preview Tier 2 Insights
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= TIER 2 SPECIFIC VIEW: UPGRADE BANNER TO TIER 3 ================= */}
                {activeTier === 'tier2' && (
                  <div className="space-y-6">
                    <ForensicAiAudit audit={result.forensicAiAudit} />

                    {/* Tier 3 Upgrade Prompt Banner */}
                    <div className="bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-zinc-950 border border-indigo-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                          <Film className="w-4 h-4" />
                          <span>Unlock Tier 3: Master Commercial & Sync Dossier</span>
                        </div>
                        <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                          Get target TV/film media placements, commercial license valuations ($40 - $8,000+), 1-click sync pitch emails, 9:16 viral TikTok story card, and the 5-step DAW revision plan.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTier('tier3')}
                        className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shrink-0 shadow-lg"
                      >
                        Preview Tier 3 Commercial Strategy
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= TIER 3 OR ALL: COMMERCIAL DOSSIER & ACTION PLAN ================= */}
                {(activeTier === 'all' || activeTier === 'tier3') && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ForensicAiAudit audit={result.forensicAiAudit} />
                    <ActionPlanCard items={result.actionPlan || []} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE: A/B HIT MATCHER ================= */}
        {mode === 'compare' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-4">
              <h2 className="text-xl font-bold text-white">A/B Reference Track Matcher</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Benchmark your target master directly against a chart-topping reference hit or commercial standard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Track A: Reference */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Track A (The Benchmark / Reference)
                    </span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                      Billboard Standard
                    </span>
                  </div>

                  <div
                    {...getDropPropsA()}
                    className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-center cursor-pointer mb-3"
                  >
                    <input {...getInputPropsA()} />
                    {fileA ? (
                      <div className="text-xs text-white font-bold truncate">{fileA.name}</div>
                    ) : (
                      <div className="text-xs text-zinc-400">
                        Drop reference MP3/WAV, or specify link below
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Or Reference Spotify, YouTube, or Stream Link:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={refSongLink}
                        onChange={e => setRefSongLink(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !isResolvingRefLink && refSongLink.trim()) {
                            handleResolveCompareLinkA();
                          }
                        }}
                        placeholder="Paste Spotify, YouTube, or song link..."
                        className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleResolveCompareLinkA()}
                        disabled={isResolvingRefLink || !refSongLink.trim()}
                        className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                        title="Stream and extract authentic studio audio from Spotify, YouTube, or audio link"
                      >
                        {isResolvingRefLink ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Streaming...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Stream Audio</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {audioUrlA && (
                  <div className="mt-4 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
                    <div className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center justify-between">
                      <span className="truncate">{fileA?.name || 'Track A Audio'}</span>
                      <span className="text-[9px] uppercase bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">Loaded</span>
                    </div>
                    <audio src={audioUrlA} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              {/* Track B: Target Master */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Track B (Target Track Being Improved)
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                      Your Unreleased Track
                    </span>
                  </div>

                  <div
                    {...getDropPropsB()}
                    className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-center cursor-pointer mb-3"
                  >
                    <input {...getInputPropsB()} />
                    {fileB ? (
                      <div className="text-xs text-white font-bold truncate">{fileB.name}</div>
                    ) : (
                      <div className="text-xs text-zinc-400">
                        Drop your target unreleased track here, or stream via link below
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Or Target Track Cloud Link (Google Drive, SoundCloud, YouTube):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={targetLinkB}
                        onChange={e => setTargetLinkB(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !isResolvingTargetLinkB && targetLinkB.trim()) {
                            handleResolveCompareLinkB();
                          }
                        }}
                        placeholder="Paste Google Drive, SoundCloud, or link..."
                        className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleResolveCompareLinkB()}
                        disabled={isResolvingTargetLinkB || !targetLinkB.trim()}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                        title="Stream and extract target unreleased track from link"
                      >
                        {isResolvingTargetLinkB ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Streaming...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Stream Audio</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {audioUrlB && (
                  <div className="mt-4 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
                    <div className="text-[11px] font-mono text-emerald-400 mb-1 flex items-center justify-between">
                      <span className="truncate">{fileB?.name || 'Track B Audio'}</span>
                      <span className="text-[9px] uppercase bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">Loaded</span>
                    </div>
                    <audio src={audioUrlB} controls className="w-full h-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Run Compare Button */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCompare}
                disabled={isAnalyzing || !fileB}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 font-extrabold text-sm hover:opacity-95 disabled:opacity-50 transition-all shadow-xl shadow-cyan-500/10 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Dissecting A/B Sonic Differences...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-5 h-5" />
                    <span>RUN A/B REFERENCE BENCHMARK</span>
                  </>
                )}
              </button>

              {(fileA || fileB || comparisonResult) && !isAnalyzing && (
                <button
                  onClick={handleResetCompare}
                  className="px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-all border border-zinc-800 flex items-center gap-2 shadow-md"
                  title="Clear comparison tracks"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>Reset Comparison</span>
                </button>
              )}
            </div>

            {/* Comparison Results */}
            {comparisonResult && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" /> A/B Sonic Comparative Findings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      Mix & Transients Difference
                    </span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {comparisonResult.comparison.sonicDifference}
                    </p>
                  </div>

                  <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Competitive Edge
                    </span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {comparisonResult.comparison.competitiveEdge}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Surgical Action Plan to Match Reference
                  </span>
                  <ul className="text-xs text-zinc-300 mt-2 space-y-1">
                    {comparisonResult.comparison.improvementAreas?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {result && (
        <>
          <SyncPitchModal
            isOpen={showSyncModal}
            onClose={() => setShowSyncModal(false)}
            result={result}
          />

          <ShareStoryCardModal
            isOpen={showStoryModal}
            onClose={() => setShowStoryModal(false)}
            result={result}
          />
        </>
      )}

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentPlan={currentPlan}
        onSelectPlan={plan => setCurrentPlan(plan)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onSaveApiKey={saveApiKey}
      />

      <LegacyReportsDrawer
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
      />
    </div>
  );
}
