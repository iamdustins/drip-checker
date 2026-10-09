import React, { useState } from 'react';
import { Sliders, Award, Film, Radio, CheckCircle, Package } from 'lucide-react';
import { DripCheckResult } from '../lib/types';

interface ArMultiPanelProps {
  panels?: DripCheckResult['executivePanels'];
  commercial?: DripCheckResult['commercialPotential'];
}

export const ArMultiPanel: React.FC<ArMultiPanelProps> = ({ panels, commercial }) => {
  const [activeTab, setActiveTab] = useState<'mix' | 'ar' | 'sync' | 'algo'>('mix');

  const safePanels = {
    mixMasterEngineer: {
      assessment: panels?.mixMasterEngineer?.assessment || 'Mix sits cleanly in the pocket with balanced frequency headroom.',
      loudnessVerdict: panels?.mixMasterEngineer?.loudnessVerdict || 'Meets commercial streaming standard.',
      frequencyBalance: panels?.mixMasterEngineer?.frequencyBalance || 'Controlled sub-bass with clear top-end air.',
      recommendedVstPlugins: panels?.mixMasterEngineer?.recommendedVstPlugins || ['FabFilter Pro-Q 3', 'iZotope Ozone 11', 'Soundtoys Decapitator'],
    },
    majorLabelAr: {
      assessment: panels?.majorLabelAr?.assessment || 'Strong sonic identity and memorable pocket delivery.',
      hookViability: panels?.majorLabelAr?.hookViability || 'High commercial memorability.',
      longevityRating: panels?.majorLabelAr?.longevityRating || 'Playlist-ready with repeatable replay value.',
    },
    syncSupervisor: {
      assessment: panels?.syncSupervisor?.assessment || 'High kinetic energy suitable for sports promos, video game soundtracks, or trailers.',
      idealMediaPlacements: panels?.syncSupervisor?.idealMediaPlacements || ['Sports Broadcast Promos', 'Action Film Montage', 'Urban Drama Series'],
      moodTags: panels?.syncSupervisor?.moodTags || ['Determined', 'Tense', 'High-Octane', 'Triumphant'],
      stemReadiness: panels?.syncSupervisor?.stemReadiness || 'One-stop stems ready for licensing.',
    },
    playlistStrategist: {
      assessment: panels?.playlistStrategist?.assessment || 'High playlist suitability across editorial hip-hop and workout lists.',
      editorialSuitability: panels?.playlistStrategist?.editorialSuitability || 'Excellent for algorithmic release radar and editorial rotation.',
      viralSnippetTimestamp: panels?.playlistStrategist?.viralSnippetTimestamp || '0:18 - 0:33',
      viralHookAdvice: panels?.playlistStrategist?.viralHookAdvice || 'Lead your video teaser with the bass drop at the hook.',
    },
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">
            Executive A&R Multi-Perspective Panel
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Industry reviews across engineering, label scouting, sync, and algorithms
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'mix'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Mixing & Mastering
          </button>
          <button
            onClick={() => setActiveTab('ar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ar'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Major Label A&R
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sync'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Sync Licensing
          </button>
          <button
            onClick={() => setActiveTab('algo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'algo'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> DSP & Algorithm
          </button>
        </div>
      </div>

      {/* Tab 1: Mixing & Mastering */}
      {activeTab === 'mix' && (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              Mix Engineer Critique
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {safePanels.mixMasterEngineer.assessment}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">Loudness & Dynamics Verdict</span>
              <p className="text-xs text-zinc-200 mt-1">{safePanels.mixMasterEngineer.loudnessVerdict}</p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">Frequency Balance</span>
              <p className="text-xs text-zinc-200 mt-1">{safePanels.mixMasterEngineer.frequencyBalance}</p>
            </div>
          </div>

          {safePanels.mixMasterEngineer.recommendedVstPlugins?.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1 mb-2">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Recommended Engineering Tools / VSTs:
              </span>
              <div className="flex flex-wrap gap-2">
                {safePanels.mixMasterEngineer.recommendedVstPlugins.map((plugin, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-cyan-300 font-mono"
                  >
                    {plugin}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Major Label A&R */}
      {activeTab === 'ar' && (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              Executive A&R Assessment
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {safePanels.majorLabelAr.assessment}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">Hook Viability & Retention</span>
              <p className="text-xs text-zinc-200 mt-1">{safePanels.majorLabelAr.hookViability}</p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">Shelf Life / Longevity</span>
              <p className="text-xs text-zinc-200 mt-1">{safePanels.majorLabelAr.longevityRating}</p>
            </div>
          </div>

          {commercial?.soundalikes && commercial.soundalikes.length > 0 && (
            <div>
              <span className="text-xs text-zinc-400 font-medium mb-2 block">
                Acoustic Soundalikes & Playlist Peers:
              </span>
              <div className="flex flex-wrap gap-2">
                {commercial.soundalikes.map((sa, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/60"
                  >
                    🎧 {sa}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Sync Licensing */}
      {activeTab === 'sync' && (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Sync Supervisor Placement Angle
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {safePanels.syncSupervisor.assessment}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">Suggested Media Placements</span>
              <ul className="text-xs text-zinc-200 mt-1 space-y-1">
                {safePanels.syncSupervisor.idealMediaPlacements?.map((p, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">Stem & Cue Readiness</span>
              <p className="text-xs text-zinc-200 mt-1">{safePanels.syncSupervisor.stemReadiness}</p>
              {commercial?.suggestedLicenseFee && (
                <div className="mt-2 pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-400">Est. Sync Fee: </span>
                  <span className="font-mono text-emerald-400 font-bold">{commercial.suggestedLicenseFee.syncFee}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: DSP & Algorithm */}
      {activeTab === 'algo' && (
        <div className="space-y-4">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              Streaming & Viral Strategy
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {safePanels.playlistStrategist.assessment}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">DSP Editorial Suitability</span>
              <p className="text-xs text-zinc-200 mt-1">{safePanels.playlistStrategist.editorialSuitability}</p>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
              <span className="text-xs text-zinc-400 font-medium">Peak TikTok/Reels Viral Segment</span>
              <div className="text-sm font-bold font-mono text-cyan-400 mt-1">
                ⏱ {safePanels.playlistStrategist.viralSnippetTimestamp || '0:18 - 0:33'}
              </div>
              <p className="text-xs text-zinc-400 mt-1">{safePanels.playlistStrategist.viralHookAdvice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
