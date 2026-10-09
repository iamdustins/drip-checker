import React, { useState } from 'react';
import { CheckSquare, Square, Wrench, ArrowRight } from 'lucide-react';
import { ActionPlanItem } from '../lib/types';

interface ActionPlanCardProps {
  items: ActionPlanItem[];
}

export const ActionPlanCard: React.FC<ActionPlanCardProps> = ({ items }) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCompletedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = items.filter(it => completedMap[it.id]).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">
              Surgical Mix & Production Fix-It Checklist
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Step-by-step engineering tweaks before sending to mastering or DSPs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-zinc-400 font-mono">
            {completedCount}/{items.length} Done ({progressPercent}%)
          </span>
          <div className="w-24 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const isDone = !!completedMap[item.id];
          return (
            <div
              key={item.id || idx}
              onClick={() => toggleItem(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isDone
                  ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                  : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 shrink-0 transition-transform active:scale-90"
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isDone ? 'line-through text-zinc-500' : 'text-zinc-200'
                    }`}
                  >
                    {item.target}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded font-medium ${
                      item.priority === 'High'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                        : item.priority === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    {item.category}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isDone ? 'line-through text-zinc-500' : 'text-zinc-300'
                  }`}
                >
                  {item.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
