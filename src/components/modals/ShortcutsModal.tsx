import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutCategory {
  title: string;
  items: { key: string; description: string }[];
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories: ShortcutCategory[] = [
    {
      title: 'Navigation & Global',
      items: [
        { key: 'Ctrl/Cmd + K', description: 'Open universal command palette & search' },
        { key: 'Ctrl/Cmd + /', description: 'Show keyboard shortcuts cheat sheet' },
        { key: 'Escape', description: 'Close active modal, drawer, or palette' },
      ],
    },
    {
      title: 'Block Editor & Markdown',
      items: [
        { key: '/', description: 'Trigger slash command menu for formatting & blocks' },
        { key: '[[', description: 'Wikilink autocomplete for note referencing' },
        { key: 'Ctrl/Cmd + B', description: 'Toggle bold formatting' },
        { key: 'Ctrl/Cmd + I', description: 'Toggle italic formatting' },
        { key: 'Ctrl/Cmd + E', description: 'Toggle inline code span' },
      ],
    },
    {
      title: 'Databases & Visual Canvas',
      items: [
        { key: 'Space + Drag', description: 'Pan across infinite whiteboard canvas' },
        { key: 'Scroll Wheel', description: 'Zoom in / out on whiteboard' },
        { key: 'Double Click', description: 'Spawn new note card on canvas coordinate' },
        { key: 'Tab / Enter', description: 'Navigate database table cells' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-[#14161f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
            <Keyboard size={18} />
            <span className="text-white">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.title}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {cat.title}
              </div>
              <div className="space-y-1.5">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
                  >
                    <span className="text-slate-300">{item.description}</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[11px] text-indigo-300">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
