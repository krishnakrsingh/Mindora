import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Sparkles, 
  Key, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { LLMProvider, AISettings } from '../../types';
import { storage } from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const currentSettings = storage.getAISettings();
  const [provider, setProvider] = useState<LLMProvider>(currentSettings.provider);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [model, setModel] = useState(currentSettings.model);
  const [temperature, setTemperature] = useState(currentSettings.temperature);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    storage.updateAISettings({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      temperature,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const getProviderDefaults = (prov: LLMProvider) => {
    switch (prov) {
      case 'gemini':
        return 'gemini-3.6-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022';
      case 'ollama':
        return 'llama3.2';
      case 'openrouter':
        return 'google/gemini-3.6-flash';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in text-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#161822] border border-white/10 rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
          <div className="flex items-center space-x-2">
            <Settings size={18} className="text-indigo-400" />
            <span className="font-bold text-sm text-white">Mindora Settings & AI Gateway</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              AI Model Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['gemini', 'openai', 'anthropic', 'ollama', 'openrouter'] as LLMProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProvider(p);
                    setModel(getProviderDefaults(p));
                  }}
                  className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all ${
                    provider === p
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          {provider !== 'ollama' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>{provider.toUpperCase()} API Key</span>
                <span className="text-[10px] text-slate-500 font-normal">Stored locally in your browser</span>
              </label>
              <input
                type="password"
                placeholder={`Paste your ${provider} API key...`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Model Name & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">
                Model Identifier
              </label>
              {provider === 'gemini' && (
                <span className="text-[10px] text-indigo-400 font-medium">
                  Verified with your Gemini API Key
                </span>
              )}
            </div>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono mb-2"
            />
            {provider === 'gemini' && (
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'gemini-3.6-flash', label: 'gemini-3.6-flash (Free Tier ✨)' },
                  { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (Free Tier ⚡)' },
                  { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite (Free Tier)' },
                  { id: 'gemini-3-flash-preview', label: 'gemini-3-flash-preview' },
                  { id: 'gemini-3.1-pro-preview', label: 'gemini-3.1-pro-preview (Pro)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                      model === m.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-1.5">
              <span>Temperature ({temperature})</span>
              <span className="text-[10px] text-slate-500">Lower = focused, Higher = creative</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 flex items-start space-x-2 text-[11px] leading-relaxed">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <span>
              Mindora operates <strong>100% locally and offline</strong> by default. When no API key is set, Mindora uses its built-in client-side hybrid vector retrieval engine.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <CheckCircle2 size={14} />
                <span>Settings saved!</span>
              </span>
            ) : <span />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

