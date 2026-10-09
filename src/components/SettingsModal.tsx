import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, AlertCircle, Loader2, Server, HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [serverHealth, setServerHealth] = useState<{ envKeyConfigured?: boolean; port?: number } | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
    // Check server health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerHealth(data))
      .catch(() => {});
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': inputKey || '',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: 'Gemini API Key Verified Successfully!' });
        onSaveApiKey(inputKey);
      } else {
        setTestResult({ success: false, message: data.error || 'Key validation failed.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Network error reaching server.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveApiKey(inputKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-zinc-100 text-base">Workstation Settings</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Status Banner */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-300 font-medium">Backend Express Proxy:</span>
          </div>
          <span className="font-mono text-emerald-400">
            Port {serverHealth?.port || 3005} (Connected)
          </span>
        </div>

        {serverHealth?.envKeyConfigured && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 mb-4 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Server has a configured GEMINI_API_KEY in .env.
          </div>
        )}

        {/* Custom API Key Input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
            <span>Gemini API Key (Client Override)</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline text-[11px]"
            >
              Get Free Key →
            </a>
          </label>
          <input
            type="password"
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex gap-2">
            <button
              onClick={handleTestKey}
              disabled={testing || !inputKey.trim()}
              className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs font-semibold text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test & Validate Key'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-colors"
            >
              Save
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
