export interface AudioDspMetrics {
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  peakDbfs: number;          // dBFS, e.g. -0.3 dB
  rmsDbfs: number;           // dBFS, e.g. -11.2 dB
  estimatedLufs: number;     // e.g. -9.5 LUFS
  dynamicRangeDb: number;    // Crest factor, e.g. 10.9 dB
  stereoCorrelation: number; // -1.0 to 1.0 (phase alignment)
  detectedBpm: number;
  tempoInfo?: {
    pulseBpm: number;        // Primary head-nod pulse, e.g. 88 BPM
    gridBpm: number;         // Trap/DAW double-time grid, e.g. 176 BPM
    formatted: string;       // e.g. "88 BPM (176 Trap Grid)"
  };
  frequencyBands: {
    subBass: number;   // 20 - 60 Hz (%)
    bass: number;      // 60 - 250 Hz (%)
    lowMids: number;   // 250 - 500 Hz (%) (mud zone)
    midrange: number;  // 500 - 2000 Hz (%)
    highMids: number;  // 2000 - 4000 Hz (%) (presence/bite)
    presence: number;  // 4000 - 6000 Hz (%) (sibilance)
    brilliance: number;// 6000 - 20000 Hz (%) (air)
  };
  temporalVariance: {
    gridDeviationMs: number; // average deviation from strict 16th grid in ms
    quantizationScore: number; // 0-100 (100 = 100% robotic locked)
  };
}

export interface RubricDeduction {
  category: string;
  description: string;
  points: number; // negative number, e.g. -6
}

export interface RubricPillarScore {
  name: string;
  score: number;       // e.g. 19
  maxScore: number;    // 25
  grade: string;       // "A", "B+", "C-", "D"
  summary: string;
  deductions: RubricDeduction[];
}

export interface RubricScorecard {
  baselineScore: number; // 100
  pillars: {
    sonicAndMix: RubricPillarScore;         // Max 25
    vocalAndLyricism: RubricPillarScore;    // Max 25
    melodyAndEarworm: RubricPillarScore;    // Max 25
    rhythmAndBassPocket: RubricPillarScore; // Max 25
  };
  totalCalculatedScore: number; // 0 - 100
  scoreTierTitle: string; // e.g. "Elite Commercial Master" or "Rough Mix / Structural Flaw"
  calibrationNotes: string; // Justification for why this exact score was awarded
}

export interface TimecodedMarker {
  timestamp: string;  // e.g. "0:42"
  seconds: number;
  type: "issue" | "highlight" | "transition" | "mix_tip";
  title: string;
  comment: string;
}

export interface ActionPlanItem {
  id: string;
  category: "Mixing" | "Arrangement" | "Vocals" | "Mastering" | "Marketing";
  priority: "High" | "Medium" | "Low";
  target: string;     // e.g. "Low-End Mud (320Hz)"
  action: string;     // e.g. "Apply a dynamic EQ notch of -2.5dB on master bus with Q=2.8"
  completed?: boolean;
}

export interface DripCheckResult {
  title: string;
  artist: string;
  genre: string;
  subGenre: string;
  bpm: number;
  tempoInfo?: {
    pulseBpm: number;
    gridBpm: number;
    formatted: string;
  };
  keySignature: string;
  tonalityInfo: {
    mode: "Minor" | "Major" | "Modal / Blues" | "Ambiguous";
    harmonicMood: string;     // e.g. "Dark Melancholic Minor", "Aggressive Drill Minor", "Bright Soulful Major"
    estimatedRoot?: string;   // e.g. "~F Minor (Estimated)"
  };
  dripScore: number;          // 0 - 100 (strictly calculated from rubricScorecard)
  rubricScorecard?: RubricScorecard;
  verdict: string;
  commercialPotential: {
    score: number;           // 0 - 100
    marketFit: string;
    targetAudience: string;
    soundalikes: string[];
    suggestedLicenseFee: {
      nonExclusive: string;  // e.g. "$40 - $75"
      exclusive: string;     // e.g. "$750 - $1,500"
      syncFee: string;       // e.g. "$2,500 - $8,000"
    };
  };
  recommendation: {
    path: "Streaming/Distribution" | "Commercial Placement" | "Private Sale" | "Social Media/YouTube";
    reasoning: string;
    rolloutStrategy: string;
  };
  scores: {
    beatImpact: number;
    vocalPresence: number;
    productionQuality: number;
    viralityPotential: number;
    harmonicComplexity: number;
    commercialRelevance: number;
  };
  scientificMetrics: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    speechiness: number;
    instrumentalness: number;
  };
  benchmarks: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    speechiness: number;
    instrumentalness: number;
    beatImpact: number;
    productionQuality: number;
  };
  forensicAiAudit: {
    humanScore: number;      // 0 - 100
    aiScore: number;         // 0 - 100
    status: "Certified Organic" | "Hybrid / Cyborg" | "Synthetic Slop (High Risk)";
    distroKidSpotifyRisk: "Safe for DSPs" | "Caution: Flagged Artifacts" | "High Risk: Takedown Likely";
    temporalPrecisionNote: string;
    spectralTextureNote: string;
    vocalNuanceNote: string;
    fingerprints: string[];
  };
  executivePanels: {
    mixMasterEngineer: {
      assessment: string;
      loudnessVerdict: string;
      frequencyBalance: string;
      recommendedVstPlugins: string[];
    };
    majorLabelAr: {
      assessment: string;
      hookViability: string;
      longevityRating: string;
    };
    syncSupervisor: {
      assessment: string;
      idealMediaPlacements: string[];
      moodTags: string[];
      stemReadiness: string;
    };
    playlistStrategist: {
      assessment: string;
      editorialSuitability: string;
      viralSnippetTimestamp: string; // e.g. "0:32 - 0:47"
      viralHookAdvice: string;
    };
  };
  artisticDelivery: {
    melodyAndCatchiness: {
      earwormScore: number;           // 0 - 100
      hookPronouncement: string;      // How distinct and pronounced the hook is
      hookArrivalTimestamp: string;   // e.g. "0:22 (Within 30s radio window)"
      melodicCritique: string;        // Critique of motif, intervals, and melodic memorability
      catchinessPrescription: string; // Exact action to make the melody 10x more infectious
    };
    vocalAndLyricism: {
      deliveryConvictionScore: number;// 0 - 100
      cadenceVelocity: string;        // e.g. "Relaxed boom-bap swing with double-time accelerations"
      rhymeComplexity: string;        // e.g. "Multi-syllabic compound end-rhymes with internal assonance"
      vocalFrictionAndTimbre: string; // e.g. "Gravelly chest rasp with tape saturation warmth"
      lyricalThemeAndStory: string;   // e.g. "Gritty cinematic imagery, avoids filler clichés"
      vocalRoomForImprovement: string;// e.g. "Add stereo doubled backing vocals on bar 4 and 8"
    };
    rhythmAndBassline: {
      basslineScore: number;          // 0 - 100
      basslineMovement: string;       // e.g. "Root-note 808 slides with sub-bass glide"
      kickBassPocket: string;         // e.g. "Kick hits on beat 1 and 3 with tight 808 decay"
      grooveTightness: string;        // e.g. "Swung off-grid hi-hat pocket"
      lowEndFix: string;              // e.g. "Tune 808 to F Minor; high-pass kick at 35Hz"
    };
  };
  timecodedNotes: TimecodedMarker[];
  actionPlan: ActionPlanItem[];
  dspMetrics?: AudioDspMetrics;
  syncPitchTemplate: {
    emailSubject: string;
    emailBody: string;
  };
}

export interface ComparisonResult {
  trackA: DripCheckResult;
  trackB: DripCheckResult;
  comparison: {
    sonicDifference: string;
    competitiveEdge: string;
    frequencyGap: string;
    loudnessGap: string;
    improvementAreas: string[];
    marketFit: string;
    verdict: string;
  };
}
