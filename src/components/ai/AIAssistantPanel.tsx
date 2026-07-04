import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  ExternalLink, 
  Check, 
  RotateCcw, 
  Bot, 
  User, 
  FileText, 
  HelpCircle,
  Cpu
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
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am **Mindora AI**, your workspace intelligence assistant.
      
I have indexed your workspace documents and knowledge graph. You can ask me to:
- Synthesize ideas across multiple notes.
- Find connections or contradictions.
- Draft or rewrite sections in your active document.
- Generate structured outlines, tables, and task lists.`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        content: `Error synthesizing response: ${err.message || 'Unknown error'}. Please check your API key in Settings.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-96 h-full border-l border-white/5 bg-[#121318] flex flex-col z-30 select-text text-xs shadow-2xl animate-fade-in">
      {/* AI Panel Header */}
      <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between bg-[#161822]/60 select-none">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center space-x-1.5">
              <span>Mindora AI</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                {settings.apiKey ? settings.provider : 'Local Hybrid'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Close AI panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mb-1">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User size={11} />
                </>
              ) : (
                <>
                  <Bot size={11} className="text-indigo-400" />
                  <span className="font-semibold text-slate-400">Mindora Assistant</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-[#181a24] border border-white/5 text-slate-200 rounded-bl-sm shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations Pills */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/5">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                    Workspace Citations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => onNavigateToPage(c.pageTitle)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] transition-colors"
                        title={c.excerpt}
                      >
                        <FileText size={10} />
                        <span className="truncate max-w-[130px]">{c.pageTitle}</span>
                        <ExternalLink size={9} className="opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 p-2 bg-[#181a24] rounded-xl border border-white/5 max-w-[200px] animate-pulse">
            <Cpu size={14} className="text-indigo-400 animate-spin" />
            <span className="text-xs">Searching workspace...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 border-t border-white/5 bg-[#121318] flex items-center space-x-1.5 overflow-x-auto text-[11px] select-none">
        <button
          onClick={() => handleSend('Summarize the main themes across all my documents')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
        >
          ✨ Summarize workspace
        </button>
        <button
          onClick={() => handleSend('What are the key priorities in the product roadmap?')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
        >
          🎯 Product priorities
        </button>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-white/5 bg-[#161822]/60">
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
            placeholder="Ask about your knowledge..."
            className="w-full px-3 py-2 pr-10 rounded-xl bg-[#1c1e29] border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 text-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </aside>
  );
};

