import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Flag } from 'lucide-react';
import { TimecodedMarker } from '../lib/types';

interface WaveformPlayerProps {
  audioUrl: string | null;
  fileName?: string;
  markers?: TimecodedMarker[];
  onMarkerClick?: (marker: TimecodedMarker) => void;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  fileName,
  markers = [],
  onMarkerClick,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);

  // Generate waveform peaks from audio
  useEffect(() => {
    if (!audioUrl) return;

    fetch(audioUrl)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        return audioCtx.decodeAudioData(arrayBuffer).then(decoded => {
          audioCtx.close().catch(() => {});
          const channelData = decoded.getChannelData(0);
          const numBars = 120;
          const step = Math.floor(channelData.length / numBars);
          const peaks: number[] = [];

          for (let i = 0; i < numBars; i++) {
            let max = 0;
            const start = i * step;
            for (let j = 0; j < step; j += 8) {
              const val = Math.abs(channelData[start + j] || 0);
              if (val > max) max = val;
            }
            peaks.push(Math.min(1, max));
          }
          setWaveformPeaks(peaks);
        });
      })
      .catch(() => {
        // Fallback random-styled waveform if decode fails
        const mockPeaks = Array.from({ length: 120 }, () => 0.15 + Math.random() * 0.7);
        setWaveformPeaks(mockPeaks);
      });
  }, [audioUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, duration));
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(progress * duration);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-xl backdrop-blur-sm">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <div>
            <div className="font-semibold text-zinc-100 text-sm truncate max-w-xs sm:max-w-md">
              {fileName || "Loaded Audio Track"}
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Quick jump to markers */}
        {markers.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
              <Flag className="w-3 h-3 text-cyan-400" /> Cues:
            </span>
            {markers.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  seekTo(m.seconds);
                  if (onMarkerClick) onMarkerClick(m);
                }}
                className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
                  m.type === 'issue'
                    ? 'bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800/60'
                    : 'bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 border border-cyan-800/60'
                }`}
                title={`${m.title}: ${m.comment}`}
              >
                {m.timestamp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Waveform Canvas / Bars */}
      <div
        onClick={handleWaveformClick}
        className="relative h-16 w-full bg-zinc-950/70 border border-zinc-800/80 rounded-lg flex items-center px-2 cursor-pointer group overflow-hidden"
      >
        {/* Playhead indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{
            left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          }}
        />

        {/* Waveform Bars */}
        <div className="w-full h-full flex items-center justify-between gap-[2px]">
          {waveformPeaks.map((peak, idx) => {
            const barProgress = idx / waveformPeaks.length;
            const currentProgress = duration > 0 ? currentTime / duration : 0;
            const isPassed = barProgress <= currentProgress;

            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-75 ${
                  isPassed
                    ? 'bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.4)]'
                    : 'bg-zinc-700/60 group-hover:bg-zinc-600'
                }`}
                style={{
                  height: `${Math.max(8, peak * 90)}%`,
                }}
              />
            );
          })}
        </div>

        {/* Marker Pins on Waveform */}
        {duration > 0 &&
          markers.map((m, idx) => {
            const markerPercent = (m.seconds / duration) * 100;
            if (markerPercent < 0 || markerPercent > 100) return null;
            return (
              <div
                key={idx}
                className="absolute top-1 z-20 group/marker"
                style={{ left: `${markerPercent}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  seekTo(m.seconds);
                }}
              >
                <div
                  className={`w-2.5 h-2.5 -ml-1.25 rounded-full border border-black cursor-pointer transform hover:scale-125 transition-transform ${
                    m.type === 'issue' ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};
