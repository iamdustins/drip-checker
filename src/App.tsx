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

  // Compare Mode Files & Results
  const [fileA, setFileA] = useState<File | null>(null);
  const [audioUrlA, setAudioUrlA] = useState<string | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [audioUrlB, setAudioUrlB] = useState<string | null>(null);
  const [refSongLink, setRefSongLink] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

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
            {/* Audio Dropzone / Upload Area */}
            {!result && (
              <div
                {...getSingleDropProps()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isSingleDragActive
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : file
                    ? 'border-zinc-700 bg-zinc-900/60'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                }`}
              >
                <input {...getSingleInputProps()} />
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-xl">
                  {file ? <Music className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>

                {file ? (
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{file.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono mb-4">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'audio/mp3'}
                    </p>
                    <p className="text-xs text-cyan-400 font-semibold">
                      Click or drop another file to replace
                    </p>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* Analysis Action Button & Status */}
            {file && !result && (
              <div className="flex flex-col items-center gap-3">
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
                      Or Reference Song Name / Spotify Link:
                    </label>
                    <input
                      type="text"
                      value={refSongLink}
                      onChange={e => setRefSongLink(e.target.value)}
                      placeholder="e.g. Travis Scott - FE!N, or Metro Boomin master"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {audioUrlA && (
                  <div className="mt-4">
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
                        Drop your target unreleased track here
                      </div>
                    )}
                  </div>
                </div>

                {audioUrlB && (
                  <div className="mt-4">
                    <audio src={audioUrlB} controls className="w-full h-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Run Compare Button */}
            <div className="text-center pt-2">
              <button
                onClick={handleCompare}
                disabled={isAnalyzing || !fileB}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 font-extrabold text-sm hover:opacity-95 disabled:opacity-50 transition-all shadow-xl shadow-cyan-500/10 flex items-center gap-2 mx-auto"
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
