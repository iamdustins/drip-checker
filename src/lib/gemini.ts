import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  feedback: {
    beat: string;
    style: string;
    vocals: string;
    overall: string;
  };
  scores: {
    beat: number;
    vocals: number;
    production: number;
    virality: number;
  };
  metrics: {
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
    vocalPresence: number;
    productionQuality: number;
    viralityPotential: number;
  };
  recommendation: {
    path: "Streaming/Distribution" | "Commercial Placement" | "Private Sale" | "Social Media/YouTube";
    reasoning: string;
  };
  aiDetection: {
    humanScore: number;
    aiScore: number;
    status: "Safe" | "Caution" | "High Risk";
    fingerprints: string[];
  };
  strengths: string[];
  weaknesses: string[];
  dripScore: number;
  verdict: string;
}

export async function analyzeAudio(base64Data: string, mimeType: string, fileName?: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are a World-Class Executive Music Producer and A&R scout. 
            "Hear" this audio track and sonically dissect it using principles from "Hit Song Science" (HSS).
            
            RESEARCH GROUNDING (Source: Hit Song Science & CNN Spectrogram Analysis):
            - Audio Feature Correlations: Our research shows Danceability (+0.09) and Production Quality (Duration/Loudness) are key positive popularity predictors.
            - Negative Predictors: High Instrumentalness (-0.03) and excessive Liveness (-0.02) typically correlate with lower mainstream popularity.
            - Technical weighting: Prioritize rhythmic stability (Danceability) and spectral balance (Production Quality) when calculating the Drip Score.
            
            ${fileName ? `The file name is: "${fileName}". Use this as a hint for the title if metadata is missing.` : ""}
            
            Provide concise, punchy feedback on the beat, style, vocals (if present), and overall potential.
            Be honest, blunt, and professional. Use music industry terminology.
            
            CRITICAL: If the track is an INSTRUMENTAL, focus heavily on the arrangement, sound selection, and melodic structure.
            CRITICAL: You MUST provide realistic numerical scores (1-100) for all metrics.
            CRITICAL: You MUST provide at least 3 specific strengths and 3 specific weaknesses.
            CRITICAL: You MUST identify the BPM (e.g. 140). DO NOT provide the Key Signature.
            
            SCIENTIFIC METRICS (0-100):
            - Danceability: Rhythm stability & beat strength.
            - Energy: Intensity and activity.
            - Valence: Musical positiveness.
            - Acousticness: Acoustic vs electronic profile.
            - Speechiness: Presence of spoken words.
            - Instrumentalness: Likelihood of no vocals.
            
            AI INFLUENCE DETECTION:
            Analyze the track for "AI Fingerprints" that major streaming platforms (like Spotify) use to flag content. Look for:
            - Perfect quantization (lack of human micro-timing/swing).
            - Spectral artifacts or "metallic" resonances common in AI generators.
            - Harmonic predictability or overly standard progressions.
            - Vocal "uncanny valley" (unnatural resonance or lack of breath/inflection).
            Provide a "Human vs AI" percentage score and a distribution risk status (Safe, Caution, High Risk).
            
            MAINSTREAM BENCHMARKS:
            For each metric, provide a "Mainstream Benchmark" score representing what a typical viral or successful hit in this specific genre/style would score.
            
            STRATEGIC RECOMMENDATION:
            Define the best "Path Forward" for this track from these 4 avenues:
            1. Streaming/Distribution (DSP release)
            2. Commercial Placement (Sync/Licensing)
            3. Private Sale (Exclusive to Vocalists/Rappers)
            4. Social Media/YouTube (Content Creation/Viral focus)
            
            Return the analysis in the following JSON format:
            {
              "title": "string",
              "artist": "string",
              "genre": "string",
              "bpm": number,
              "feedback": {
                "beat": "string",
                "style": "string",
                "vocals": "string",
                "overall": "string"
              },
              "scores": {
                "beat": number,
                "vocals": number,
                "production": number,
                "virality": number
              },
              "metrics": {
                "danceability": number,
                "energy": number,
                "valence": number,
                "acousticness": number,
                "speechiness": number,
                "instrumentalness": number
              },
              "benchmarks": {
                "danceability": number,
                "energy": number,
                "valence": number,
                "acousticness": number,
                "speechiness": number,
                "instrumentalness": number,
                "beatImpact": number,
                "vocalPresence": number,
                "productionQuality": number,
                "viralityPotential": number
              },
              "recommendation": {
                "path": "one of the 4 avenues",
                "reasoning": "string"
              },
              "aiDetection": {
                "humanScore": number,
                "aiScore": number,
                "status": "Safe | Caution | High Risk",
                "fingerprints": ["string"]
              },
              "strengths": ["string"],
              "weaknesses": ["string"],
              "dripScore": number,
              "verdict": "string"
            }`
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["title", "artist", "genre", "bpm", "feedback", "scores", "metrics", "benchmarks", "recommendation", "aiDetection", "strengths", "weaknesses", "dripScore", "verdict"],
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          genre: { type: Type.STRING },
          bpm: { type: Type.NUMBER },
          feedback: {
            type: Type.OBJECT,
            required: ["beat", "style", "vocals", "overall"],
            properties: {
              beat: { type: Type.STRING },
              style: { type: Type.STRING },
              vocals: { type: Type.STRING },
              overall: { type: Type.STRING }
            }
          },
          scores: {
            type: Type.OBJECT,
            required: ["beat", "vocals", "production", "virality"],
            properties: {
              beat: { type: Type.NUMBER },
              vocals: { type: Type.NUMBER },
              production: { type: Type.NUMBER },
              virality: { type: Type.NUMBER }
            }
          },
          metrics: {
            type: Type.OBJECT,
            required: ["danceability", "energy", "valence", "acousticness", "speechiness", "instrumentalness"],
            properties: {
              danceability: { type: Type.NUMBER },
              energy: { type: Type.NUMBER },
              valence: { type: Type.NUMBER },
              acousticness: { type: Type.NUMBER },
              speechiness: { type: Type.NUMBER },
              instrumentalness: { type: Type.NUMBER }
            }
          },
          benchmarks: {
            type: Type.OBJECT,
            required: ["danceability", "energy", "valence", "acousticness", "speechiness", "instrumentalness", "beatImpact", "vocalPresence", "productionQuality", "viralityPotential"],
            properties: {
              danceability: { type: Type.NUMBER },
              energy: { type: Type.NUMBER },
              valence: { type: Type.NUMBER },
              acousticness: { type: Type.NUMBER },
              speechiness: { type: Type.NUMBER },
              instrumentalness: { type: Type.NUMBER },
              beatImpact: { type: Type.NUMBER },
              vocalPresence: { type: Type.NUMBER },
              productionQuality: { type: Type.NUMBER },
              viralityPotential: { type: Type.NUMBER }
            }
          },
          recommendation: {
            type: Type.OBJECT,
            required: ["path", "reasoning"],
            properties: {
              path: { type: Type.STRING, enum: ["Streaming/Distribution", "Commercial Placement", "Private Sale", "Social Media/YouTube"] },
              reasoning: { type: Type.STRING }
            }
          },
          aiDetection: {
            type: Type.OBJECT,
            required: ["humanScore", "aiScore", "status", "fingerprints"],
            properties: {
              humanScore: { type: Type.NUMBER },
              aiScore: { type: Type.NUMBER },
              status: { type: Type.STRING, enum: ["Safe", "Caution", "High Risk"] },
              fingerprints: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          dripScore: { type: Type.NUMBER },
          verdict: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  const parsed = JSON.parse(text);
  console.log("Analysis Result:", parsed);
  return parsed;
}

export interface ComparisonResult {
  trackA: AnalysisResult;
  trackB: AnalysisResult;
  comparison: {
    sonicDifference: string;
    competitiveEdge: string;
    improvementAreas: string[];
    marketFit: string;
  };
}

export async function compareTracks(
  base64A: string | null,
  mimeTypeA: string | null,
  base64B: string,
  mimeTypeB: string,
  referenceLink?: string
): Promise<ComparisonResult> {
  const parts: any[] = [
    {
      text: `You are a World-Class Executive Music Producer. 
      Analyze and COMPARE these two audio tracks. 
      
      ${base64A ? 'Track A is the REFERENCE (the "Hit" or benchmark).' : `The REFERENCE is the famous song at this link: ${referenceLink}. Use your internal knowledge of its sonic profile.`}
      Track B is the TARGET (the track being improved).
      
      Provide a full AnalysisResult for BOTH, then a detailed comparison.
      Include the following scientific metrics (0-100) for both tracks: Danceability, Energy, Valence, Acousticness, Speechiness, Instrumentalness.
      
      Return JSON:
      {
        "trackA": { ...AnalysisResult schema including metrics... },
        "trackB": { ...AnalysisResult schema including metrics... },
        "comparison": {
          "sonicDifference": "How they differ in mix, energy, and transients",
          "competitiveEdge": "What Track B has that Track A doesn't (or vice versa)",
          "improvementAreas": ["Specific technical fixes for Track B to match Track A's quality"],
          "marketFit": "How Track B fits in the current market compared to the hit Track A"
        }
      }`
    }
  ];

  if (base64A && mimeTypeA) {
    parts.push({ inlineData: { data: base64A, mimeType: mimeTypeA } });
  }
  
  parts.push({ inlineData: { data: base64B, mimeType: mimeTypeB } });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}
