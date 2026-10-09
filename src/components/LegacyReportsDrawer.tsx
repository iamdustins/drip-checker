import React, { useState, useEffect } from 'react';
import { X, FolderArchive, FileText, ChevronRight, Download, Loader2 } from 'lucide-react';

interface LegacyReportsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegacyReportsDrawer: React.FC<LegacyReportsDrawerProps> = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState<{ filename: string; size: number; modifiedAt: string }[]>([]);
  const [selectedReport, setSelectedReport] = useState<{ filename: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/legacy-reports')
      .then(res => res.json())
      .then(data => {
        setReports(data.reports || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const loadReport = (filename: string) => {
    fetch(`/api/legacy-reports/${encodeURIComponent(filename)}`)
      .then(res => res.json())
      .then(data => {
        setSelectedReport(data);
      })
      .catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-zinc-100 text-base">Historical Analysis Reports Archive</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              {reports.length} Reports
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* File List */}
          <div className="overflow-y-auto space-y-1.5 pr-2 border-r border-zinc-800/80">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-zinc-500 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading archive...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-500">
                No past reports found in archive directory.
              </div>
            ) : (
              reports.map((r, i) => (
                <div
                  key={i}
                  onClick={() => loadReport(r.filename)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedReport?.filename === r.filename
                      ? 'bg-cyan-950/60 border-cyan-700 text-cyan-200'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span className="truncate">{r.filename}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                </div>
              ))
            )}
          </div>

          {/* Report Viewer */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800/80 p-3 overflow-y-auto font-mono text-xs text-zinc-300 whitespace-pre-wrap select-all">
            {selectedReport ? (
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-500">
                  <span>{selectedReport.filename}</span>
                  <button
                    onClick={() => {
                      const blob = new Blob([selectedReport.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = selectedReport.filename;
                      a.click();
                    }}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download .txt
                  </button>
                </div>
                {selectedReport.content}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
                Select a report on the left to read its forensic breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
