import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Music, Upload, Loader2, Play, Pause, CheckCircle2, AlertCircle, BarChart3, Zap, Mic2, Disc, Info, ChevronDown, BookOpen, Target } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeAudio, compareTracks, type AnalysisResult, type ComparisonResult } from "@/src/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioElement2, setAudioElement2] = useState<HTMLAudioElement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [referenceLink, setReferenceLink] = useState("");
  const [file2, setFile2] = useState<File | null>(null);
  const [audioUrl2, setAudioUrl2] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl(url);
      setResult(null);
      setComparisonResult(null);
      setError(null);
    }
  }, []);

  const onDrop2 = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile2(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl2(url);
      setComparisonResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
    },
    multiple: false,
  } as any);

  const { getRootProps: getRootProps2, getInputProps: getInputProps2, isDragActive: isDragActive2 } = useDropzone({
    onDrop: onDrop2,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
    },
    multiple: false,
  } as any);

  const handlePlayPause = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePlayPause2 = () => {
    if (!audioElement2) return;
    if (isPlaying2) {
      audioElement2.pause();
    } else {
      audioElement2.play();
    }
    setIsPlaying2(!isPlaying2);
  };

  const downloadReport = (data: AnalysisResult | ComparisonResult, isComparison: boolean, fileName?: string) => {
    let content = "";
    const timestamp = new Date().toLocaleString();
    const cleanFileName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "Track";

    if (isComparison) {
      const comp = data as ComparisonResult;
      content = `
DRIPCHECK AI - SONIC COMPARISON REPORT
Generated: ${timestamp}
Input File: ${fileName || "N/A"}
--------------------------------------------------

REFERENCE TRACK: ${comp.trackA.title} by ${comp.trackA.artist}
Drip Score: ${comp.trackA.dripScore}/100
BPM: ${comp.trackA.bpm}

TARGET TRACK: ${comp.trackB.title} by ${comp.trackB.artist}
Drip Score: ${comp.trackB.dripScore}/100
BPM: ${comp.trackB.bpm}

SONIC COMPARISON
================
Sonic Difference: ${comp.comparison.sonicDifference}
Competitive Edge: ${comp.comparison.competitiveEdge}
Market Fit: ${comp.comparison.marketFit}

IMPROVEMENT ROADMAP
-------------------
${comp.comparison.improvementAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}

SCIENTIFIC BENCHMARKS (Ref vs Target)
-------------------------------------
Danceability: ${comp.trackA.metrics.danceability}% vs ${comp.trackB.metrics.danceability}%
Energy: ${comp.trackA.metrics.energy}% vs ${comp.trackB.metrics.energy}%
Valence: ${comp.trackA.metrics.valence}% vs ${comp.trackB.metrics.valence}%
Acousticness: ${comp.trackA.metrics.acousticness}% vs ${comp.trackB.metrics.acousticness}%
Speechiness: ${comp.trackA.metrics.speechiness}% vs ${comp.trackB.metrics.speechiness}%
Instrumentalness: ${comp.trackA.metrics.instrumentalness}% vs ${comp.trackB.metrics.instrumentalness}%
`;
    } else {
      const res = data as AnalysisResult;
      content = `
DRIPCHECK AI - SONIC ANALYSIS REPORT
Generated: ${timestamp}
Input File: ${fileName || "N/A"}
--------------------------------------------------

TRACK: ${res.title}
ARTIST: ${res.artist}
GENRE: ${res.genre}
BPM: ${res.bpm}

DRIP SCORE: ${res.dripScore}/100
VERDICT: ${res.verdict}

STRATEGIC RECOMMENDATION
========================
Path: ${res.recommendation.path}
Reasoning: ${res.recommendation.reasoning}

A&R FEEDBACK
============
The Beat: ${res.feedback.beat}
Vocals/Lead: ${res.feedback.vocals}
Style/Vibe: ${res.feedback.style}
Commercial Potential: ${res.feedback.overall}

METRICS (Track vs Mainstream Benchmark)
---------------------------------------
Beat Impact: ${res.scores.beat}% (Benchmark: ${res.benchmarks.beatImpact}%)
Vocal Presence: ${res.scores.vocals}% (Benchmark: ${res.benchmarks.vocalPresence}%)
Production Quality: ${res.scores.production}% (Benchmark: ${res.benchmarks.productionQuality}%)
Virality Potential: ${res.scores.virality}% (Benchmark: ${res.benchmarks.viralityPotential}%)

SCIENTIFIC DATA (Track vs Mainstream Benchmark)
-----------------------------------------------
Danceability: ${res.metrics.danceability}% (Benchmark: ${res.benchmarks.danceability}%)
Energy: ${res.metrics.energy}% (Benchmark: ${res.benchmarks.energy}%)
Valence: ${res.metrics.valence}% (Benchmark: ${res.benchmarks.valence}%)
Acousticness: ${res.metrics.acousticness}% (Benchmark: ${res.benchmarks.acousticness}%)
Speechiness: ${res.metrics.speechiness}% (Benchmark: ${res.benchmarks.speechiness}%)
Instrumentalness: ${res.metrics.instrumentalness}% (Benchmark: ${res.benchmarks.instrumentalness}%)

AI INFLUENCE CHECK
==================
Human Score: ${res.aiDetection.humanScore}%
AI Score: ${res.aiDetection.aiScore}%
Distribution Risk: ${res.aiDetection.status}
Fingerprints Detected:
${res.aiDetection.fingerprints.map(f => `- ${f}`).join('\n')}

STRENGTHS
---------
${res.strengths.map(s => `+ ${s}`).join('\n')}

WEAKNESSES
----------
${res.weaknesses.map(w => `- ${w}`).join('\n')}
`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DripCheck_${cleanFileName}_Report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const getBase64 = (f: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
        });
      };

      const base64 = await getBase64(file);

      if (isComparisonMode) {
        let base64A: string | null = null;
        let mimeTypeA: string | null = null;

        if (file2) {
          base64A = await getBase64(file2);
          mimeTypeA = file2.type;
        }

        const comparison = await compareTracks(base64A, mimeTypeA, base64, file.type, referenceLink);
        setComparisonResult(comparison);
        downloadReport(comparison, true, file.name);
      } else {
        const analysis = await analyzeAudio(base64, file.type, file.name);
        setResult(analysis);
        downloadReport(analysis, false, file.name);
      }
      setIsAnalyzing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze track. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg text-white selection:bg-studio-accent/30">
      {/* Header */}
      <header className="border-b border-studio-border bg-studio-bg/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-studio-accent rounded-lg flex items-center justify-center glow-amber">
              <Music className="text-black w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight glow-text">DRIPCHECK AI</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-studio-muted">
            <Button 
              variant="ghost" 
              className="text-xs font-mono tracking-widest hover:text-studio-accent gap-2"
              onClick={() => setShowHelp(!showHelp)}
            >
              <Info className="w-4 h-4" /> HOW IT WORKS
            </Button>
            <a href="#" className="hover:text-studio-accent transition-colors">DASHBOARD</a>
            <a href="#" className="hover:text-studio-accent transition-colors">HISTORY</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="studio-glass rounded-[32px] p-8 md:p-12 border border-studio-accent/20 bg-studio-accent/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-studio-accent">
                      <BookOpen className="w-6 h-6" />
                      <h3 className="text-xl font-black uppercase tracking-widest">The Core Logic</h3>
                    </div>
                    <div className="space-y-4 text-sm text-studio-muted leading-relaxed">
                      <p>
                        <strong className="text-white">CNN Spectrogram Analysis:</strong> DripCheck AI uses deep learning to analyze the "Mel Spectrogram" of your audio. This translates waveforms into frequency data, allowing the AI to "hear" transients, harmonic density, and rhythmic consistency like a producer.
                      </p>
                      <p>
                        <strong className="text-white">Hit Song Science (HSS) Framework:</strong> Our scoring model is grounded in peer-reviewed research analyzing correlations between audio features and mainstream success. 
                      </p>
                      <ul className="space-y-2 list-disc list-inside bg-black/40 p-4 rounded-xl border border-studio-border/50">
                        <li><span className="text-studio-accent font-bold">Danceability:</span> Rhythmic stability is the #1 sonic predictor (+0.09).</li>
                        <li><span className="text-studio-accent font-bold">Sonic Profile:</span> Energy and spectral balance define commercial "vibe".</li>
                        <li><span className="text-studio-accent font-bold">Risk Check:</span> High Instrumentalness/Liveness often correlate with niche market placement.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-studio-accent">
                      <Target className="w-6 h-6" />
                      <h3 className="text-xl font-black uppercase tracking-widest">Operational Guide</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-2xl bg-black/30 border border-studio-border">
                        <h4 className="text-xs font-bold text-white mb-1 uppercase">1. Single Track Analysis</h4>
                        <p className="text-xs text-studio-muted">Upload your MP3/WAV. The AI provides a full A&R report, scientific metrics, and a strategic distribution recommendation.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-black/30 border border-studio-border">
                        <h4 className="text-xs font-bold text-white mb-1 uppercase">2. Comparison Mode</h4>
                        <p className="text-xs text-studio-muted">Toggle Comparison Mode to bench your track against a "Hit". Paste a link or upload a second file to see exactly how your transients and mix compare.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-black/30 border border-studio-border">
                        <h4 className="text-xs font-bold text-white mb-1 uppercase">3. AI Influence Check</h4>
                        <p className="text-xs text-studio-muted">Check the "AI CHECK" tab before distribution. We look for perfect quantization and spectral signatures that get tracks flagged on Spotify.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button variant="ghost" className="text-[10px] font-mono tracking-widest text-studio-accent" onClick={() => setShowHelp(false)}>
                    CLOSE LOGIC PANEL <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-12">
          
          {/* Top Section: Upload & Player (Full Width) */}
          <section className="max-w-4xl mx-auto w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <Button 
                  variant={isComparisonMode ? "default" : "outline"}
                  className={`rounded-full px-8 h-10 font-bold tracking-widest uppercase transition-all ${isComparisonMode ? "bg-studio-accent text-black" : "text-studio-muted border-studio-border"}`}
                  onClick={() => setIsComparisonMode(!isComparisonMode)}
                >
                  {isComparisonMode ? "Comparison Mode: ON" : "Single Track Mode"}
                </Button>
              </div>
              <h2 className="text-4xl font-black tracking-tighter flex items-center justify-center gap-3">
                <Upload className="w-10 h-10 text-studio-accent" />
                {isComparisonMode ? "COMPARE TRACKS" : "DROP THE TRACK"}
              </h2>
              <p className="text-studio-muted max-w-md mx-auto">
                {isComparisonMode 
                  ? "Compare your track against a known hit or another demo to see how it stacks up."
                  : "Upload your latest master or instrumental demo. Our AI A&R will sonically dissect the transients, harmonics, and commercial potential."}
              </p>
            </div>

            <div className={`grid grid-cols-1 ${isComparisonMode ? "md:grid-cols-2" : ""} gap-8`}>
              {/* Reference Input (Only in Comparison Mode) */}
              {isComparisonMode && (
                <div className="space-y-4">
                  <div className="bg-studio-card/20 border border-studio-border rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-mono tracking-widest text-studio-accent uppercase">1. Reference (The "Hit")</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Paste YouTube/Spotify/SoundCloud link..."
                          className="w-full bg-studio-bg border border-studio-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-studio-accent transition-colors"
                          value={referenceLink}
                          onChange={(e) => setReferenceLink(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-studio-muted uppercase">OR</div>
                      </div>
                      
                      <div
                        {...getRootProps2()}
                        className={`
                          border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
                          flex flex-col items-center justify-center text-center gap-3
                          ${isDragActive2 ? "border-studio-accent bg-studio-accent/5" : "border-studio-border hover:border-studio-accent/50 hover:bg-studio-card/50"}
                          ${file2 ? "bg-studio-card/30 border-studio-accent/30" : "bg-studio-card/10"}
                        `}
                      >
                        <input {...getInputProps2()} />
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${file2 ? "bg-studio-accent text-black" : "bg-studio-border text-studio-muted"}`}>
                          {file2 ? <Music className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <p className="text-sm font-bold truncate max-w-full">
                          {file2 ? file2.name : "Upload Reference File"}
                        </p>
                      </div>

                      {file2 && audioUrl2 && (
                        <div className="flex items-center justify-between bg-studio-bg/50 p-3 rounded-xl border border-studio-border">
                          <div className="flex items-center gap-3">
                            <Disc className="w-4 h-4 text-studio-accent animate-spin-slow" />
                            <span className="text-[10px] font-mono text-studio-muted uppercase">Reference Audio</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-full text-studio-accent hover:bg-studio-accent/10"
                            onClick={handlePlayPause2}
                          >
                            {isPlaying2 ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </Button>
                          <audio
                            src={audioUrl2}
                            ref={(el) => setAudioElement2(el)}
                            onEnded={() => setIsPlaying2(false)}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Target Input */}
              <div className="space-y-4">
                <div className={`bg-studio-card/20 border border-studio-border rounded-3xl p-6 space-y-4 ${isComparisonMode ? "" : "max-w-2xl mx-auto"}`}>
                  {isComparisonMode && <h3 className="text-xs font-mono tracking-widest text-studio-accent uppercase">2. Your Track (The Target)</h3>}
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer
                      flex flex-col items-center justify-center text-center gap-6
                      ${isDragActive ? "border-studio-accent bg-studio-accent/5" : "border-studio-border hover:border-studio-accent/50 hover:bg-studio-card/50"}
                      ${file ? "bg-studio-card/30 border-studio-accent/30" : "bg-studio-card/10"}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${file ? "bg-studio-accent text-black" : "bg-studio-border text-studio-muted"}`}>
                      {file ? <Music className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {file ? file.name : "Upload Your Track"}
                      </p>
                      <p className="text-xs text-studio-muted mt-2">
                        MP3, WAV, M4A up to 20MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {file && audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="studio-glass rounded-3xl p-8 glow-amber"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="font-black text-2xl truncate max-w-[300px] md:max-w-md uppercase tracking-tight">{file.name}</h3>
                    <p className="text-xs text-studio-muted font-mono uppercase tracking-widest">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • READY FOR DISSECTION
                    </p>
                  </div>
                  <Button
                    size="icon"
                    className="rounded-full w-16 h-16 bg-studio-accent text-black hover:bg-studio-accent/90 shadow-lg shadow-studio-accent/20"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>
                </div>
                
                <audio
                  src={audioUrl}
                  ref={(el) => setAudioElement(el)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <div className="space-y-4 pt-6 border-t border-studio-border">
                  <Button
                    className="w-full h-16 text-xl font-black bg-studio-accent text-black hover:bg-studio-accent/90 disabled:opacity-50 rounded-2xl tracking-widest uppercase"
                    onClick={startAnalysis}
                    disabled={isAnalyzing || (isComparisonMode && !file2 && !referenceLink)}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        {isComparisonMode ? "COMPARING TRACKS..." : "DISSECTING AUDIO..."}
                      </>
                    ) : (
                      isComparisonMode ? "RUN COMPARISON TEST" : "RUN THE DRIP TEST"
                    )}
                  </Button>
                  {error && (
                    <div className="flex items-center gap-3 text-red-400 text-sm bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </section>

          {/* Bottom Section: Results (Full Width) */}
          <section className="w-full">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-4xl mx-auto min-h-[500px] flex flex-col items-center justify-center text-center gap-8 studio-glass rounded-[40px]"
                >
                  <div className="relative">
                    <div className="w-32 h-32 border-4 border-studio-accent/10 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-32 h-32 border-t-4 border-studio-accent rounded-full animate-spin" />
                    <Music className="absolute inset-0 m-auto w-12 h-12 text-studio-accent animate-bounce" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black tracking-widest uppercase glow-text">Sonic Profile Extraction</h3>
                    <p className="text-studio-muted max-w-sm mx-auto leading-relaxed">
                      Measuring transients, spectral density, harmonic presence, and commercial "drip" factor...
                    </p>
                  </div>
                </motion.div>
              ) : comparisonResult ? (
                <motion.div
                  key="comparison"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-6xl mx-auto space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Track A (Reference) */}
                    <div className="studio-glass rounded-[40px] p-8 relative overflow-hidden opacity-80 border-studio-border/50">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-studio-border text-white text-[10px]">REFERENCE</Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-studio-border" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * comparisonResult.trackA.dripScore) / 100} className="text-studio-muted" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black">{comparisonResult.trackA.dripScore}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase truncate max-w-[200px]">{comparisonResult.trackA.title}</h3>
                          <p className="text-sm text-studio-muted">{comparisonResult.trackA.artist}</p>
                        </div>
                      </div>
                    </div>

                    {/* Track B (Target) */}
                    <div className="studio-glass rounded-[40px] p-8 relative overflow-hidden border-studio-accent/30 glow-amber">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-studio-accent text-black text-[10px]">TARGET</Badge>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-studio-border" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * comparisonResult.trackB.dripScore) / 100} className="text-studio-accent" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black glow-text">{comparisonResult.trackB.dripScore}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase truncate max-w-[200px]">{comparisonResult.trackB.title}</h3>
                          <p className="text-sm text-studio-accent font-bold">{comparisonResult.trackB.artist}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Insight */}
                  <div className="studio-glass rounded-[40px] p-12 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <h4 className="text-xs font-mono tracking-widest text-studio-accent uppercase">Sonic Difference</h4>
                        <p className="text-lg leading-relaxed text-studio-muted">{comparisonResult.comparison.sonicDifference}</p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-mono tracking-widest text-studio-accent uppercase">Competitive Edge</h4>
                        <p className="text-lg leading-relaxed text-studio-muted">{comparisonResult.comparison.competitiveEdge}</p>
                      </div>
                    </div>

                    <Separator className="bg-studio-border" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-xs font-mono tracking-widest text-studio-accent uppercase">Improvement Roadmap</h4>
                        <ul className="space-y-4">
                          {comparisonResult.comparison.improvementAreas.map((area, i) => (
                            <li key={i} className="flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-studio-accent/20 text-studio-accent flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                              <span className="text-studio-muted">{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-xs font-mono tracking-widest text-studio-accent uppercase">Market Fit Analysis</h4>
                        <p className="text-studio-accent text-xl font-medium leading-relaxed">
                          {comparisonResult.comparison.marketFit}
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-studio-border" />

                    <div className="space-y-8">
                      <h4 className="text-xs font-mono tracking-widest text-studio-accent uppercase text-center">Scientific Benchmark Comparison</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8">
                        {[
                          { label: 'Danceability', key: 'danceability' },
                          { label: 'Energy', key: 'energy' },
                          { label: 'Valence', key: 'valence' },
                          { label: 'Acousticness', key: 'acousticness' },
                          { label: 'Speechiness', key: 'speechiness' },
                          { label: 'Instrumentalness', key: 'instrumentalness' }
                        ].map((metric) => (
                          <div key={metric.key} className="space-y-3">
                            <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase text-studio-muted">
                              <span>{metric.label}</span>
                              <div className="flex gap-4">
                                <span>Ref: {comparisonResult.trackA.metrics?.[metric.key as keyof typeof comparisonResult.trackA.metrics] || 0}%</span>
                                <span className="text-studio-accent">Target: {comparisonResult.trackB.metrics?.[metric.key as keyof typeof comparisonResult.trackB.metrics] || 0}%</span>
                              </div>
                            </div>
                            <div className="relative h-2 bg-studio-border rounded-full overflow-hidden">
                              <div 
                                className="absolute h-full bg-studio-muted opacity-30 transition-all duration-1000" 
                                style={{ width: `${comparisonResult.trackA.metrics?.[metric.key as keyof typeof comparisonResult.trackA.metrics] || 0}%` }}
                              />
                              <div 
                                className="absolute h-full bg-studio-accent transition-all duration-1000" 
                                style={{ width: `${comparisonResult.trackB.metrics?.[metric.key as keyof typeof comparisonResult.trackB.metrics] || 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-12">
                    <Button
                      variant="default"
                      className="bg-studio-accent text-black hover:bg-studio-accent/90 rounded-full px-12 h-14 font-bold tracking-widest uppercase"
                      onClick={() => downloadReport(comparisonResult, true)}
                    >
                      DOWNLOAD FULL REPORT
                    </Button>
                    <Button
                      variant="outline"
                      className="text-studio-muted hover:text-studio-accent border-studio-border hover:bg-studio-border rounded-full px-12 h-14 font-bold tracking-widest uppercase"
                      onClick={() => {
                        setComparisonResult(null);
                        setResult(null);
                        setFile(null);
                        setFile2(null);
                        setAudioUrl(null);
                        setAudioUrl2(null);
                        setReferenceLink("");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      NEW COMPARISON
                    </Button>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-5xl mx-auto space-y-8"
                >
                  {/* Score Header */}
                  <div className="studio-glass rounded-[40px] p-10 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                      <Badge variant="outline" className="border-studio-accent/30 text-studio-accent/70 font-mono px-4 py-1 rounded-full text-[10px] tracking-widest">
                        A&R REPORT #{Math.floor(Math.random() * 10000)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                      <div className="relative">
                        <svg className="w-56 h-56 transform -rotate-90">
                          <circle
                            cx="112"
                            cy="112"
                            r="100"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-studio-border"
                          />
                          <motion.circle
                            cx="112"
                            cy="112"
                            r="100"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={628}
                            initial={{ strokeDashoffset: 628 }}
                            animate={{ strokeDashoffset: 628 - (628 * (result?.dripScore || 0)) / 100 }}
                            transition={{ duration: 2, ease: "circOut" }}
                            className="text-studio-accent"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black glow-text">{result?.dripScore || 0}</span>
                          <span className="text-xs font-mono text-studio-muted uppercase tracking-[0.3em] mt-2">DRIP SCORE</span>
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left space-y-4">
                        <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{result?.title || "Untitled Master"}</h2>
                        <p className="text-xl text-studio-accent font-medium flex items-center justify-center md:justify-start gap-3">
                          <Disc className="w-6 h-6" />
                          {result?.artist && result.artist !== "Unknown Artist" ? result.artist : "Unsigned Talent"} • {result?.genre && result.genre !== "Unknown Genre" ? result.genre : "Experimental"}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                          <div className="bg-studio-border/30 px-6 py-2 rounded-xl font-mono text-sm border border-studio-border/50">
                            BPM: <span className="text-studio-accent font-bold">{result?.bpm || "--"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-12 p-8 bg-studio-accent/5 border border-studio-accent/20 rounded-3xl relative">
                      <div className="absolute -top-3 left-8 px-3 bg-studio-bg text-[10px] font-mono text-studio-accent tracking-widest uppercase">The Verdict</div>
                      <p className="text-lg md:text-xl italic text-studio-accent/90 leading-relaxed font-medium text-center md:text-left">
                        " {result?.verdict || "Analysis complete."} "
                      </p>
                    </div>
                  </div>

                  {/* Detailed Feedback Tabs */}
                  <Tabs defaultValue="feedback" className="w-full" aria-label="Analysis results">
                    <TabsList className="flex flex-wrap md:grid w-full md:grid-cols-6 bg-studio-card/50 border border-studio-border h-auto md:h-16 p-1 rounded-2xl gap-1">
                      <TabsTrigger value="feedback" className="flex-1 min-w-[100px] rounded-xl text-[10px] md:text-sm font-bold tracking-widest data-[state=active]:bg-studio-accent data-[state=active]:text-black" aria-label="A&R Feedback">FEEDBACK</TabsTrigger>
                      <TabsTrigger value="metrics" className="flex-1 min-w-[100px] rounded-xl text-[10px] md:text-sm font-bold tracking-widest data-[state=active]:bg-studio-accent data-[state=active]:text-black" aria-label="Performance Metrics">METRICS</TabsTrigger>
                      <TabsTrigger value="scientific" className="flex-1 min-w-[100px] rounded-xl text-[10px] md:text-sm font-bold tracking-widest data-[state=active]:bg-studio-accent data-[state=active]:text-black" aria-label="Scientific Analysis">SCIENTIFIC</TabsTrigger>
                      <TabsTrigger value="swot" className="flex-1 min-w-[100px] rounded-xl text-[10px] md:text-sm font-bold tracking-widest data-[state=active]:bg-studio-accent data-[state=active]:text-black" aria-label="Strengths and Weaknesses">STRENGTHS</TabsTrigger>
                      <TabsTrigger value="strategy" className="flex-1 min-w-[100px] rounded-xl text-[10px] md:text-sm font-bold tracking-widest data-[state=active]:bg-studio-accent data-[state=active]:text-black" aria-label="Strategic Path">STRATEGY</TabsTrigger>
                      <TabsTrigger value="aicheck" className="flex-1 min-w-[100px] rounded-xl text-[10px] md:text-sm font-bold tracking-widest data-[state=active]:bg-studio-accent data-[state=active]:text-black" aria-label="AI Influence Check">AI CHECK</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="feedback" className="mt-8 space-y-6 outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-studio-card/40 border-studio-border rounded-3xl overflow-hidden shadow-xl">
                          <CardHeader className="pb-4 bg-studio-border/20">
                            <CardTitle className="text-xs font-mono tracking-[0.2em] flex items-center gap-2 uppercase text-studio-accent">
                              <Zap className="w-4 h-4" aria-hidden="true" /> The Beat
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <p className="text-base text-studio-muted leading-relaxed font-medium">{result.feedback?.beat || "No feedback available."}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-studio-card/40 border-studio-border rounded-3xl overflow-hidden shadow-xl">
                          <CardHeader className="pb-4 bg-studio-border/20">
                            <CardTitle className="text-xs font-mono tracking-[0.2em] flex items-center gap-2 uppercase text-studio-accent">
                              <Mic2 className="w-4 h-4" aria-hidden="true" /> Vocals / Lead
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <p className="text-base text-studio-muted leading-relaxed font-medium">{result.feedback?.vocals || "No feedback available."}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-studio-card/40 border-studio-border rounded-3xl overflow-hidden shadow-xl">
                          <CardHeader className="pb-4 bg-studio-border/20">
                            <CardTitle className="text-xs font-mono tracking-[0.2em] flex items-center gap-2 uppercase text-studio-accent">
                              <Disc className="w-4 h-4" aria-hidden="true" /> Style / Vibe
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <p className="text-base text-studio-muted leading-relaxed font-medium">{result.feedback?.style || "No feedback available."}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-studio-card/40 border-studio-border rounded-3xl overflow-hidden shadow-xl">
                          <CardHeader className="pb-4 bg-studio-border/20">
                            <CardTitle className="text-xs font-mono tracking-[0.2em] flex items-center gap-2 uppercase text-studio-accent">
                              <BarChart3 className="w-4 h-4" aria-hidden="true" /> Commercial Potential
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <p className="text-base text-studio-muted leading-relaxed font-medium">{result.feedback?.overall || "No feedback available."}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="metrics" className="mt-8">
                      <div className="studio-glass rounded-[40px] p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs font-mono tracking-widest uppercase">
                              <span>Beat Impact</span>
                              <div className="flex gap-4">
                                <span className="text-studio-muted">Benchmark: {result.benchmarks?.beatImpact || 0}%</span>
                                <span className="text-studio-accent">{result.scores?.beat || 0}%</span>
                              </div>
                            </div>
                            <div className="relative h-3 bg-studio-border rounded-full overflow-hidden">
                              <div className="absolute h-full bg-studio-muted/30 transition-all duration-1000" style={{ width: `${result.benchmarks?.beatImpact || 0}%` }} />
                              <div className="absolute h-full bg-studio-accent transition-all duration-1000" style={{ width: `${result.scores?.beat || 0}%` }} />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs font-mono tracking-widest uppercase">
                              <span>Vocal / Lead Presence</span>
                              <div className="flex gap-4">
                                <span className="text-studio-muted">Benchmark: {result.benchmarks?.vocalPresence || 0}%</span>
                                <span className="text-studio-accent">{result.scores?.vocals || 0}%</span>
                              </div>
                            </div>
                            <div className="relative h-3 bg-studio-border rounded-full overflow-hidden">
                              <div className="absolute h-full bg-studio-muted/30 transition-all duration-1000" style={{ width: `${result.benchmarks?.vocalPresence || 0}%` }} />
                              <div className="absolute h-full bg-studio-accent transition-all duration-1000" style={{ width: `${result.scores?.vocals || 0}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs font-mono tracking-widest uppercase">
                              <span>Production Quality</span>
                              <div className="flex gap-4">
                                <span className="text-studio-muted">Benchmark: {result.benchmarks?.productionQuality || 0}%</span>
                                <span className="text-studio-accent">{result.scores?.production || 0}%</span>
                              </div>
                            </div>
                            <div className="relative h-3 bg-studio-border rounded-full overflow-hidden">
                              <div className="absolute h-full bg-studio-muted/30 transition-all duration-1000" style={{ width: `${result.benchmarks?.productionQuality || 0}%` }} />
                              <div className="absolute h-full bg-studio-accent transition-all duration-1000" style={{ width: `${result.scores?.production || 0}%` }} />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs font-mono tracking-widest uppercase text-studio-accent">
                              <span>Virality Potential</span>
                              <div className="flex gap-4">
                                <span className="text-studio-muted">Benchmark: {result.benchmarks?.viralityPotential || 0}%</span>
                                <span>{result.scores?.virality || 0}%</span>
                              </div>
                            </div>
                            <div className="relative h-3 bg-studio-accent/20 rounded-full overflow-hidden">
                              <div className="absolute h-full bg-studio-muted/30 transition-all duration-1000" style={{ width: `${result.benchmarks?.viralityPotential || 0}%` }} />
                              <div className="absolute h-full bg-studio-accent transition-all duration-1000" style={{ width: `${result.scores?.virality || 0}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="scientific" className="mt-8">
                      <div className="studio-glass rounded-[40px] p-12 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                          {[
                            { label: 'Danceability', key: 'danceability', desc: 'Rhythm stability & beat strength' },
                            { label: 'Energy', key: 'energy', desc: 'Intensity & activity level' },
                            { label: 'Valence', key: 'valence', desc: 'Musical positiveness / mood' },
                            { label: 'Acousticness', key: 'acousticness', desc: 'Acoustic vs Electronic profile' },
                            { label: 'Speechiness', key: 'speechiness', desc: 'Presence of spoken words' },
                            { label: 'Instrumentalness', key: 'instrumentalness', desc: 'Likelihood of no vocals' }
                          ].map((metric) => (
                            <div key={metric.key} className="space-y-4">
                              <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-mono tracking-widest text-studio-accent uppercase">{metric.label}</h4>
                                  <p className="text-[10px] text-studio-muted uppercase">{metric.desc}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] font-mono text-studio-muted uppercase">Benchmark: {result.benchmarks?.[metric.key as keyof typeof result.benchmarks] || 0}%</div>
                                  <span className="text-xl font-black text-studio-accent">{result.metrics?.[metric.key as keyof typeof result.metrics] || 0}%</span>
                                </div>
                              </div>
                              <div className="relative h-2 bg-studio-border rounded-full overflow-hidden">
                                <div className="absolute h-full bg-studio-muted/30 transition-all duration-1000" style={{ width: `${result.benchmarks?.[metric.key as keyof typeof result.benchmarks] || 0}%` }} />
                                <div className="absolute h-full bg-studio-accent transition-all duration-1000" style={{ width: `${result.metrics?.[metric.key as keyof typeof result.metrics] || 0}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-6 bg-studio-accent/5 border border-studio-accent/10 rounded-2xl">
                          <p className="text-xs text-studio-muted leading-relaxed italic">
                            * These metrics are compared against "Mainstream Benchmarks" derived from successful hits in this genre.
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="strategy" className="mt-8 outline-none">
                      <Card className="bg-studio-card/40 border-studio-border rounded-[32px] overflow-hidden shadow-2xl">
                        <CardHeader className="bg-studio-accent/10 border-b border-studio-accent/20 pb-8">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                              <CardTitle className="text-studio-accent flex items-center gap-3 tracking-widest uppercase text-2xl font-black">
                                <Zap className="w-8 h-8" aria-hidden="true" /> Strategic Path Forward
                              </CardTitle>
                              <CardDescription className="text-studio-muted font-mono text-xs uppercase tracking-widest">
                                Recommended Avenue for Maximum Impact
                              </CardDescription>
                            </div>
                            <Badge className="bg-studio-accent text-black px-6 py-2 rounded-full text-sm font-black tracking-widest">
                              {result.recommendation?.path || "TBD"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-10">
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <h4 className="text-xs font-mono tracking-[0.3em] text-studio-muted uppercase">A&R Reasoning</h4>
                              <p className="text-xl text-white leading-relaxed font-medium italic">
                                "{result.recommendation?.reasoning || "No reasoning provided."}"
                              </p>
                            </div>
                            
                            <Separator className="bg-studio-border" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="p-6 rounded-2xl bg-studio-card/30 border border-studio-border space-y-3">
                                <h5 className="text-[10px] font-mono text-studio-accent uppercase tracking-widest">Primary Objective</h5>
                                <p className="text-sm text-studio-muted">
                                  Focus all marketing and creative efforts on the <span className="text-white font-bold">{result.recommendation?.path}</span> channel to leverage the track's inherent sonic strengths.
                                </p>
                              </div>
                              <div className="p-6 rounded-2xl bg-studio-card/30 border border-studio-border space-y-3">
                                <h5 className="text-[10px] font-mono text-studio-accent uppercase tracking-widest">Next Action</h5>
                                <p className="text-sm text-studio-muted">
                                  Review the "Improvement Roadmap" in the comparison tab or the "Weaknesses" section to polish the track for this specific avenue.
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="aicheck" className="mt-8 outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="md:col-span-2 bg-studio-card/40 border-studio-border rounded-[32px] overflow-hidden shadow-2xl">
                          <CardHeader className="bg-studio-border/20 pb-8">
                            <CardTitle className="text-xs font-mono tracking-[0.2em] flex items-center gap-2 uppercase text-studio-accent">
                              <AlertCircle className="w-4 h-4" /> AI Influence Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-8 space-y-10">
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                              <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-studio-border" />
                                  <motion.circle
                                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * (result.aiDetection?.humanScore || 0)) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="text-studio-accent"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl font-black">{result.aiDetection?.humanScore || 0}%</span>
                                  <span className="text-[8px] font-mono text-studio-muted uppercase tracking-widest">HUMAN</span>
                                </div>
                              </div>
                              
                              <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-mono text-studio-muted uppercase tracking-widest">AI Probability</span>
                                    <span className="text-xl font-black text-studio-accent">{result.aiDetection?.aiScore || 0}%</span>
                                  </div>
                                  <Progress value={result.aiDetection?.aiScore || 0} className="h-2 bg-studio-border" />
                                </div>
                                
                                <div className="p-4 rounded-xl bg-studio-bg/50 border border-studio-border">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                                      result.aiDetection?.status === 'Safe' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                                      result.aiDetection?.status === 'Caution' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                      'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                    }`} />
                                    <span className="text-sm font-bold tracking-widest uppercase">
                                      Distribution Risk: <span className={
                                        result.aiDetection?.status === 'Safe' ? 'text-green-500' :
                                        result.aiDetection?.status === 'Caution' ? 'text-amber-500' :
                                        'text-red-500'
                                      }>{result.aiDetection?.status || "Unknown"}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="text-xs font-mono tracking-[0.3em] text-studio-muted uppercase">Detected Fingerprints</h4>
                              <div className="flex flex-wrap gap-3">
                                {result.aiDetection?.fingerprints.map((fingerprint, i) => (
                                  <Badge key={i} variant="outline" className="bg-studio-accent/5 border-studio-accent/20 text-studio-accent/80 px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider">
                                    {fingerprint}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-studio-card/40 border-studio-border rounded-[32px] overflow-hidden shadow-2xl">
                          <CardHeader className="bg-studio-accent/10 pb-6">
                            <CardTitle className="text-xs font-mono tracking-[0.2em] uppercase text-studio-accent">Distribution Insight</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            <p className="text-sm text-studio-muted leading-relaxed">
                              Platforms like <span className="text-white font-bold">Spotify</span> and <span className="text-white font-bold">Apple Music</span> use advanced spectral analysis and timing checks to identify AI-generated content.
                            </p>
                            <p className="text-sm text-studio-muted leading-relaxed">
                              A <span className="text-green-500 font-bold">"Safe"</span> status indicates your track has enough human micro-timing variations and harmonic complexity to pass standard distribution filters.
                            </p>
                            <p className="text-xs text-studio-muted italic border-t border-studio-border pt-4">
                              * This analysis is a sonic estimation based on common AI generation patterns and does not guarantee platform acceptance.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="swot" className="mt-8 outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-studio-card/40 border-studio-border rounded-[32px] overflow-hidden shadow-2xl">
                          <CardHeader className="bg-green-500/10 border-b border-green-500/20 pb-6">
                            <CardTitle className="text-green-400 flex items-center gap-3 tracking-widest uppercase text-lg font-black">
                              <CheckCircle2 className="w-6 h-6" aria-hidden="true" /> Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-8">
                            <ul className="space-y-6">
                              {(result.strengths || []).map((s, i) => (
                                <li key={i} className="text-base text-studio-muted flex gap-4 items-start leading-relaxed font-medium">
                                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.5)]" aria-hidden="true" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="bg-studio-card/40 border-studio-border rounded-[32px] overflow-hidden shadow-2xl">
                          <CardHeader className="bg-red-500/10 border-b border-red-500/20 pb-6">
                            <CardTitle className="text-red-400 flex items-center gap-3 tracking-widest uppercase text-lg font-black">
                              <AlertCircle className="w-6 h-6" aria-hidden="true" /> Weaknesses
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-8">
                            <ul className="space-y-6">
                              {(result.weaknesses || []).map((w, i) => (
                                <li key={i} className="text-base text-studio-muted flex gap-4 items-start leading-relaxed font-medium">
                                  <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.5)]" aria-hidden="true" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-12">
                    <Button
                      variant="default"
                      className="bg-studio-accent text-black hover:bg-studio-accent/90 rounded-full px-12 h-14 font-bold tracking-widest uppercase"
                      onClick={() => downloadReport(result, false)}
                    >
                      DOWNLOAD FULL REPORT
                    </Button>
                    <Button
                      variant="outline"
                      className="text-studio-muted hover:text-studio-accent border-studio-border hover:bg-studio-border rounded-full px-12 h-14 font-bold tracking-widest uppercase"
                      onClick={() => {
                        setResult(null);
                        setFile(null);
                        setAudioUrl(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      ANALYZE ANOTHER TRACK
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="max-w-4xl mx-auto h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-studio-border rounded-[40px] bg-studio-card/5">
                  <div className="w-24 h-24 rounded-full bg-studio-border flex items-center justify-center mb-8">
                    <BarChart3 className="w-12 h-12 text-studio-muted" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 uppercase tracking-tight">Awaiting Sonic Input</h3>
                  <p className="text-studio-muted max-w-sm leading-relaxed">
                    Upload a master or instrumental on the left to begin the sonic dissection and get your Drip Report.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-studio-border py-12 mt-12 bg-studio-card/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Music className="w-5 h-5" />
            <span className="font-bold tracking-tighter">DRIPCHECK AI</span>
          </div>
          <p className="text-studio-muted text-xs font-mono">
            POWERED BY GEMINI 3 FLASH • SONIC ANALYSIS ENGINE V2.4
          </p>
          <div className="flex gap-6 text-xs font-mono text-studio-muted">
            <a href="#" className="hover:text-white">TERMS</a>
            <a href="#" className="hover:text-white">PRIVACY</a>
            <a href="#" className="hover:text-white">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
