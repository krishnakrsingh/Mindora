import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Cpu, 
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { LLMProvider, AISettings } from '../../types';
import { storage, secureKeyManager } from '../../services/storage';
import { aiService } from '../../services/ai';

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
  const [baseUrl, setBaseUrl] = useState(currentSettings.baseUrl || 'http://localhost:11434');
  const [temperature, setTemperature] = useState(currentSettings.temperature);
  const [persistKey, setPersistKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ running: boolean; message?: string; success?: boolean } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    storage.updateAISettings({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      baseUrl: baseUrl.trim(),
      temperature,
      persistKey,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleClearKey = () => {
    setApiKey('');
    secureKeyManager.clearKey();
    storage.updateAISettings({ apiKey: '' });
    setTestStatus({ running: false, success: true, message: 'API key cleared and purged from memory.' });
  };

  const handleTestConnection = async () => {
    setTestStatus({ running: true });
    const res = await aiService.testConnection({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      baseUrl: baseUrl.trim(),
      temperature,
    });
    setTestStatus({
      running: false,
      success: res.success,
      message: res.message,
    });
  };

  const getProviderDefaults = (prov: LLMProvider) => {
    switch (prov) {
      case 'ollama':
        return 'llama3.2';
      case 'gemini':
        return 'gemini-2.5-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022';
      case 'openrouter':
        return 'meta-llama/llama-3.2-3b-instruct:free';
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in text-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-2xl shadow-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e5e5e5] dark:border-[#262626] mb-5">
          <div className="flex items-center space-x-2 font-heading font-semibold text-sm text-black dark:text-white">
            <Settings size={15} />
            <span>Workspace & AI Configuration</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#737373] hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-[11px] font-medium text-[#737373] dark:text-[#a3a3a3] mb-2">
              INTELLIGENCE PROVIDER
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['ollama', 'gemini', 'openai', 'anthropic', 'openrouter'] as LLMProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setProvider(p);
                    setModel(getProviderDefaults(p));
                    setTestStatus(null);
                  }}
                  className={`btn-pill btn-pill-sm uppercase text-[10px] font-semibold ${
                    provider === p ? 'btn-pill-active' : ''
                  }`}
                >
                  {p === 'ollama' ? '🦙 Ollama (Local)' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Ollama-specific configuration */}
          {provider === 'ollama' && (
            <div className="p-3.5 rounded-xl border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#202020] space-y-3">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                <ShieldCheck size={14} />
                <span>100% Zero-Cloud Local Inference (Zero Data Leaves Your Machine)</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#737373] mb-1">
                  Ollama Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#171717] text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#737373] mb-1">
                  Local Model Name
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="llama3.2, deepseek-r1, mistral, qwen2.5"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#171717] text-black dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Cloud API Key Configuration (BYOK) */}
          {provider !== 'ollama' && (
            <div className="p-3.5 rounded-xl border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#202020] space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-mono text-[#737373]">
                    {provider.toUpperCase()} API Key (BYOK)
                  </label>
                  {apiKey && (
                    <button
                      onClick={handleClearKey}
                      className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={10} />
                      <span>Clear Key</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${provider} secret key...`}
                    className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#171717] text-black dark:text-white focus:outline-none font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2 text-[#737373] hover:text-black dark:hover:text-white"
                  >
                    {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#737373] mb-1">
                  Model Identifier
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#171717] text-black dark:text-white focus:outline-none font-mono text-xs"
                />
              </div>

              {/* Secure Storage Options */}
              <div className="pt-2 border-t border-[#e5e5e5] dark:border-[#333] flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="persistKey"
                  checked={persistKey}
                  onChange={(e) => setPersistKey(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-black dark:accent-white cursor-pointer"
                />
                <label htmlFor="persistKey" className="text-[11px] text-[#737373] cursor-pointer">
                  Persist key in browser storage (Default: session memory only)
                </label>
              </div>
            </div>
          )}

          {/* Test Connection Button & Result */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus?.running}
              className="btn-pill btn-pill-sm"
            >
              {testStatus?.running ? <RefreshCw size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
              <span>{testStatus?.running ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {testStatus?.message && (
              <span className={`text-[11px] font-medium ${testStatus.success ? 'text-emerald-500' : 'text-amber-500'}`}>
                {testStatus.message}
              </span>
            )}
          </div>

          {/* Security Guarantee Badge */}
          <div className="p-3 rounded-xl border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#1a1a1a] text-[11px] text-[#737373] dark:text-[#a3a3a3] flex items-start space-x-2">
            <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-black dark:text-white">Zero-Leak Security Standard:</span> Secret API keys are kept isolated in session memory and are strictly omitted from workspace JSON exports and backup packages.
            </div>
          </div>

          {/* Save / Footer */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-[#e5e5e5] dark:border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="btn-pill btn-pill-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-pill-primary btn-pill-sm"
            >
              {savedSuccess ? 'Saved ✓' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
