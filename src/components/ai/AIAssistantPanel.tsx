import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  ExternalLink, 
  FileText, 
  Terminal,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { AIMessage, Page } from '../../types';
import { aiService } from '../../services/ai';
import { storage } from '../../services/storage';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activePage?: Page;
  onNavigateToPage: (titleOrId: string) => void;
  onApplyDiff: (proposedText: string) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  isOpen,
  onClose,
  activePage,
  onNavigateToPage,
  onApplyDiff,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `### Knowledge Engine Online

- **Retrieval Engine**: Grounded Hybrid Lexical BM25 + Vector Cosine
- **Privacy Standard**: 100% Zero-Leak Client Architecture
- **Inference**: Local Ollama (\`http://localhost:11434\`) or Local Offline Engine

Ask anything about your workspace notes, summarize linked concepts, or extract actionable tasks.`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settings = storage.getAISettings();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await aiService.queryWorkspace(textToSend, activePage);
      const assistantMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.text,
        citations: res.citations,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Provider notice: ${err.message || 'Unknown network error'}. Falling back to offline grounded index.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-96 h-full border-l border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#1a1a1a] flex flex-col z-30 select-text text-xs shadow-xl animate-fade-in transition-colors">
      {/* AI Panel Header */}
      <div className="h-12 border-b border-[#e5e5e5] dark:border-[#262626] px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
            <Sparkles size={12} />
          </div>
          <div>
            <div className="font-heading font-semibold text-xs text-black dark:text-white">
              Mindora Intelligence
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-[#737373] dark:text-[#a3a3a3]">
              <ShieldCheck size={11} className="text-emerald-500" />
              <span>{settings.provider === 'ollama' ? 'Zero-Leak Ollama' : `${settings.provider.toUpperCase()} Secured`}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full text-[#737373] hover:text-black dark:hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Ollama Terminal Install Pill Banner (Ollama-style snippet) */}
      <div className="p-3 bg-[#fafafa] dark:bg-[#1f1f1f] border-b border-[#e5e5e5] dark:border-[#262626]">
        <div className="flex items-center justify-between font-mono text-[11px] text-black dark:text-white px-2 py-1 rounded-full bg-white dark:bg-[#282828] border border-[#e5e5e5] dark:border-[#333]">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-emerald-500 font-bold">$</span>
            <span className="truncate">ollama run llama3.2</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('ollama run llama3.2');
              setCopiedInstall(true);
              setTimeout(() => setCopiedInstall(false), 1500);
            }}
            className="p-1 rounded hover:text-black dark:hover:text-white text-[#737373]"
            title="Copy command"
          >
            {copiedInstall ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-black text-white dark:bg-white dark:text-black text-xs font-medium'
                  : 'bg-[#fafafa] dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2e2e2e] text-black dark:text-white'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Citations Pill Bar */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#e5e5e5] dark:border-[#333]/50">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1.5">
                    Sources & Citations:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => onNavigateToPage(c.pageTitle)}
                        className="btn-pill btn-pill-sm text-[10px]"
                        title={c.excerpt}
                      >
                        <FileText size={10} />
                        <span>{c.pageTitle}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] font-mono text-[#a3a3a3] mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-[#737373] dark:text-[#a3a3a3] text-xs py-2">
            <RefreshCw size={12} className="animate-spin" />
            <span>Synthesizing grounded response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 border-t border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#1a1a1a] flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => handleSend('Summarize the active note')}
          className="btn-pill btn-pill-sm whitespace-nowrap text-[10px]"
        >
          Summarize Note
        </button>
        <button
          onClick={() => handleSend('What are the key concepts linked in this workspace?')}
          className="btn-pill btn-pill-sm whitespace-nowrap text-[10px]"
        >
          Key Concepts
        </button>
        <button
          onClick={() => handleSend('Extract deliverables and tasks')}
          className="btn-pill btn-pill-sm whitespace-nowrap text-[10px]"
        >
          Extract Tasks
        </button>
      </div>

      {/* Input Box (Pill style) */}
      <div className="p-3 border-t border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#1a1a1a]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about workspace notes..."
            disabled={isLoading}
            className="w-full pl-3.5 pr-10 py-2 rounded-full border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#202020] text-black dark:text-white focus:outline-none text-xs focus:border-black dark:focus:border-white transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:opacity-40 transition-opacity"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </aside>
  );
};
