# DRIPCHECK PRO v2.0
### Forensic Audio Intelligence & Commercial A&R Workstation

---

## 1. Overview & Vision
**DripCheck Pro** is a commercial-grade audio forensics, Hit Song Science (HSS), and executive A&R workstation. It empowers producers, independent artists, mixing engineers, and sync licensing agents to dissect, benchmark, and optimize audio tracks before commercial release.

It bridges the gap between **deterministic Web Audio DSP physics** (LUFS, True Peak, Crest Factor, Stereo Phase, 7-Band FFT) and **multimodal AI intelligence (Gemini 2.5 / 3)** to deliver surgical, actionable feedback that DSP algorithms and record labels demand.

---

## 2. Core Functional Modules

### Module 1: Browser-Side Web Audio DSP Engine
- **Integrated LUFS & RMS**: Computes ITU-R BS.1770 K-weighted loudness metrics to verify Spotify/Apple Music streaming compliance (-14 LUFS target).
- **True Peak dBFS**: Evaluates inter-sample peak distortion and ceiling headroom.
- **Dynamic Range / Crest Factor**: Flags over-compressed "brickwalled" masters vs punchy transient dynamics.
- **Stereo Phase Correlation**: Real-time phase alignment meter (-1.0 to +1.0) to safeguard mono playback on phone and club systems.
- **7-Band FFT Spectral Distribution**: Analyzes Sub-Bass (20-60Hz), Bass (60-250Hz), Low-Mids Mud Zone (250-500Hz), Midrange, High-Mids Bite, Presence (Sibilance), and Air (6-20kHz).
- **Micro-Timing Variance**: Quantifies mathematical swing deviation from strict 16th-note grids (identifying human groove vs robotic quantization).

### Module 2: The 3-Pillar Forensic AI & Artifact Audit
*(Grounded in the proprietary whitepaper: `DRIPCHECK AI: Forensic Audio Logic & Artifact Analysis`)*
- **Pillar 1: Temporal Precision**: Measures micro-timing pocket drift vs 100% rigid grid quantization.
- **Pillar 2: Spectral Texture**: Inspects the 12kHz+ band for metallic neural shimmer, blocky spectrogram compression, and deconvolution phase incoherence.
- **Pillar 3: Vocal Nuance & Biometrics**: Detects authentic biological breath intakes, natural sibilance, and dynamic vibrato vs uncanny synthetic timbre morphing.
- **Platform Distribution Risk Badge**: Certifies tracks as *"Safe for DSPs"*, *"Caution: Flagged Artifacts"*, or *"High Risk: Takedown Likely"* (protecting against Spotify/DistroKid AI slop penalties).

### Module 3: Executive A&R Multi-Perspective Panel
- **Senior Mixing & Mastering Engineer**: Surgical frequency cuts/boosts with exact Hz and dB recommendations, dynamic EQ advice, and recommended VST plugins.
- **Major Label A&R Scout**: Arrangement flow, hook retention, commercial longevity rating, and acoustic soundalikes.
- **Sync Licensing Supervisor**: Viable film, television, gaming, and commercial trailer placements; mood tags; and stem delivery readiness.
- **DSP & TikTok Algorithm Strategist**: Editorial playlisting suitability, skip-rate vulnerability, and identification of the peak 15-30s viral hook segment.

### Module 4: Interactive Waveform Workstation
- Canvas-rendered audio waveform with real-time scrub head.
- **Timecoded Cue Markers**: Color-coded pins for issues, highlights, and transitions. Clicking any cue jumps playback directly to that second in the song.

### Module 5: High-Value Deliverables & Monetization
- **Executive PDF One-Sheet**: 1-click printable pitch deck with radar scores, track metadata, and sync readiness for label submissions.
- **Viral 9:16 Story Card**: Exportable Instagram Story / TikTok card displaying Drip Score, human authenticity percentage, and verdict.
- **Sync Pitch Email Generator**: Formatted, one-stop licensing pitch email ready to send to music supervisors with estimated sync valuation ($2,500 - $8,000).
- **Surgical Mix Fix-It Checklist**: Interactive 5-step action plan with checkboxes for the DAW session.

### Module 6: A/B Reference Hit Matcher
- Direct side-by-side comparison between your target unreleased mix and a Billboard benchmark track (or reference link).
- Highlights sonic differences, transient punch gaps, and a step-by-step roadmap to achieve commercial parity.

---

## 3. How to Launch and Access

### Quick Start (Windows 1-Click)
Double-click `start.bat` in the project folder, or run:
```bash
start.bat
```
This automatically opens your browser to **`http://localhost:3005`** and boots the unified server.

### Manual Launch (Command Line)
1. Install dependencies (already completed):
   ```bash
   npm install
   ```
2. Start the workstation:
   ```bash
   npm run dev
   ```
3. Open **`http://localhost:3005`** in your browser.

---

## 4. API Configuration
- You can add your `GEMINI_API_KEY` to the `.env` file:
  ```env
  PORT=3005
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- Or enter it directly in the in-app **Settings Modal** (gear icon in the top right), which saves it securely in your browser's local storage.
