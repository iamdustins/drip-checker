import { AudioDspMetrics } from './types';

/**
 * Perform client-side mathematical DSP analysis on an AudioBuffer using standard Web Audio math.
 */
export async function analyzeAudioDsp(file: File): Promise<AudioDspMetrics> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 44100
  });

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  }

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const durationSeconds = audioBuffer.duration;

  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

  // 1. Calculate Peak & RMS
  let maxAbs = 0;
  let sumSquare = 0;
  let correlationSumNum = 0;
  let correlationSumDenLeft = 0;
  let correlationSumDenRight = 0;

  // Sample every Nth sample for performance on large files
  const step = Math.max(1, Math.floor(length / 500000));
  let count = 0;

  for (let i = 0; i < length; i += step) {
    const l = leftChannel[i];
    const r = rightChannel[i];
    const absL = Math.abs(l);
    const absR = Math.abs(r);
    const peak = Math.max(absL, absR);
    if (peak > maxAbs) maxAbs = peak;

    const mono = (l + r) * 0.5;
    sumSquare += mono * mono;

    // Stereo correlation
    correlationSumNum += l * r;
    correlationSumDenLeft += l * l;
    correlationSumDenRight += r * r;
    count++;
  }

  const rms = Math.sqrt(sumSquare / Math.max(1, count));
  const peakDbfs = maxAbs > 0 ? Math.max(-96, Math.round(20 * Math.log10(maxAbs) * 10) / 10) : -96;
  const rmsDbfs = rms > 0 ? Math.max(-96, Math.round(20 * Math.log10(rms) * 10) / 10) : -96;

  // Estimated LUFS (ITU-R BS.1770 K-weighting approximation ~ RMS - 3dB offset)
  const estimatedLufs = Math.max(-96, Math.round((rmsDbfs - 3.1) * 10) / 10);
  const dynamicRangeDb = Math.max(0, Math.round((peakDbfs - rmsDbfs) * 10) / 10);

  // Stereo correlation (-1 to +1)
  const denom = Math.sqrt(correlationSumDenLeft * correlationSumDenRight);
  const stereoCorrelation = denom > 0 ? Math.round((correlationSumNum / denom) * 100) / 100 : 1.0;

  // 2. Frequency Spectral Distribution via Offline FFT
  const freqBands = await calculateFrequencyBands(audioBuffer);

  // 3. Transient Onset & Micro-Timing Variance
  const { detectedBpm, tempoInfo, temporalVariance } = calculateTimingAndBpm(leftChannel, sampleRate);

  return {
    durationSeconds: Math.round(durationSeconds * 10) / 10,
    sampleRate,
    channels: numChannels,
    peakDbfs,
    rmsDbfs,
    estimatedLufs,
    dynamicRangeDb,
    stereoCorrelation,
    detectedBpm,
    tempoInfo,
    frequencyBands: freqBands,
    temporalVariance,
  };
}

/**
 * FFT Frequency Band calculation using OfflineAudioContext & AnalyserNode
 */
async function calculateFrequencyBands(buffer: AudioBuffer) {
  const fftSize = 2048;
  const sampleRate = buffer.sampleRate;
  const channelData = buffer.getChannelData(0);

  // Take 10 evenly spaced 2048-sample windows across the audio
  const numSlices = 12;
  const subBassBins = [20, 60];
  const bassBins = [60, 250];
  const lowMidBins = [250, 500];
  const midBins = [500, 2000];
  const highMidBins = [2000, 4000];
  const presenceBins = [4000, 6000];
  const brillianceBins = [6000, 20000];

  let totalEnergy = 0;
  let bandEnergy = {
    subBass: 0,
    bass: 0,
    lowMids: 0,
    midrange: 0,
    highMids: 0,
    presence: 0,
    brilliance: 0,
  };

  const binWidth = sampleRate / fftSize;

  for (let s = 1; s <= numSlices; s++) {
    const startIndex = Math.floor((buffer.length * s) / (numSlices + 2));
    if (startIndex + fftSize > buffer.length) break;

    // Windowed slice (Hanning window)
    const windowed = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      const hanning = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
      windowed[i] = channelData[startIndex + i] * hanning;
    }

    // Compute basic DFT magnitude across relevant bins (or octave bands)
    for (let k = 1; k < fftSize / 2; k++) {
      const freq = k * binWidth;
      // Approximate magnitude by summing squared correlation
      let re = 0, im = 0;
      const angleStep = (2 * Math.PI * k) / fftSize;
      // Stride of 4 for speed
      for (let n = 0; n < fftSize; n += 4) {
        const angle = angleStep * n;
        re += windowed[n] * Math.cos(angle);
        im -= windowed[n] * Math.sin(angle);
      }
      const magSq = (re * re + im * im);

      totalEnergy += magSq;
      if (freq >= subBassBins[0] && freq < subBassBins[1]) bandEnergy.subBass += magSq;
      else if (freq >= bassBins[0] && freq < bassBins[1]) bandEnergy.bass += magSq;
      else if (freq >= lowMidBins[0] && freq < lowMidBins[1]) bandEnergy.lowMids += magSq;
      else if (freq >= midBins[0] && freq < midBins[1]) bandEnergy.midrange += magSq;
      else if (freq >= highMidBins[0] && freq < highMidBins[1]) bandEnergy.highMids += magSq;
      else if (freq >= presenceBins[0] && freq < presenceBins[1]) bandEnergy.presence += magSq;
      else if (freq >= brillianceBins[0] && freq <= brillianceBins[1]) bandEnergy.brilliance += magSq;
    }
  }

  const safeTotal = Math.max(0.0001, totalEnergy);
  return {
    subBass: Math.round((bandEnergy.subBass / safeTotal) * 100),
    bass: Math.round((bandEnergy.bass / safeTotal) * 100),
    lowMids: Math.round((bandEnergy.lowMids / safeTotal) * 100),
    midrange: Math.round((bandEnergy.midrange / safeTotal) * 100),
    highMids: Math.round((bandEnergy.highMids / safeTotal) * 100),
    presence: Math.round((bandEnergy.presence / safeTotal) * 100),
    brilliance: Math.round((bandEnergy.brilliance / safeTotal) * 100),
  };
}

/**
 * Fast onset detector and BPM/Groove estimation
 */
function calculateTimingAndBpm(channelData: Float32Array, sampleRate: number) {
  // Compute energy envelope with 1024 sample hops (~23ms)
  const hopSize = 1024;
  const numHops = Math.min(Math.floor(channelData.length / hopSize), 2500); // Analyze up to ~1 minute
  const energy = new Float32Array(numHops);

  for (let h = 0; h < numHops; h++) {
    let sum = 0;
    const start = h * hopSize;
    for (let i = 0; i < hopSize; i++) {
      const v = channelData[start + i];
      sum += v * v;
    }
    energy[h] = Math.sqrt(sum / hopSize);
  }

  // Find peaks in first derivative (onsets)
  const onsets: number[] = [];
  for (let h = 1; h < numHops - 1; h++) {
    const diff = energy[h] - energy[h - 1];
    if (diff > 0.04 && energy[h] > energy[h + 1]) {
      onsets.push((h * hopSize) / sampleRate);
    }
  }

  // Inter-onset interval (IOI) histogram for BPM estimation
  const iois: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    const delta = onsets[i] - onsets[i - 1];
    if (delta >= 0.25 && delta <= 1.2) { // 50 to 240 BPM interval
      iois.push(delta);
    }
  }

  let pulseBpm = 120;
  let gridBpm = 120;
  let detectedBpm = 120;

  if (iois.length > 5) {
    // Sort and find median interval
    iois.sort((a, b) => a - b);
    const medianDelta = iois[Math.floor(iois.length / 2)];
    const rawBpm = Math.round(60 / medianDelta);

    if (rawBpm >= 125) {
      gridBpm = Math.min(220, Math.max(120, rawBpm));
      pulseBpm = Math.round(gridBpm / 2);
    } else if (rawBpm <= 95) {
      pulseBpm = Math.min(100, Math.max(50, rawBpm));
      gridBpm = pulseBpm * 2;
    } else {
      pulseBpm = rawBpm;
      gridBpm = rawBpm;
    }
    // Set detectedBpm to the primary human head-nod pulse (e.g. 75-100 or 120)
    detectedBpm = pulseBpm;
  }

  // Calculate grid deviation (temporal swing vs machine grid)
  let gridDeviationSum = 0;
  let matchedOnsets = 0;
  const beatInterval = 60 / detectedBpm;
  const sixteenthInterval = beatInterval / 4;

  for (const onset of onsets) {
    const nearest16th = Math.round(onset / sixteenthInterval) * sixteenthInterval;
    const deviationMs = Math.abs(onset - nearest16th) * 1000;
    if (deviationMs < 45) { // within reasonable pocket
      gridDeviationSum += deviationMs;
      matchedOnsets++;
    }
  }

  const avgDevMs = matchedOnsets > 0 ? Math.round((gridDeviationSum / matchedOnsets) * 10) / 10 : 12.5;
  // 0ms deviation = 100% quantization (robotic). 18ms+ deviation = organic human pocket.
  const quantizationScore = Math.min(100, Math.max(0, Math.round(100 - (avgDevMs / 25) * 100)));

  return {
    detectedBpm,
    tempoInfo: {
      pulseBpm,
      gridBpm,
      formatted: pulseBpm !== gridBpm
        ? `${pulseBpm} BPM (${gridBpm} Trap/DAW Grid)`
        : `${pulseBpm} BPM`,
    },
    temporalVariance: {
      gridDeviationMs: avgDevMs,
      quantizationScore,
    },
  };
}
