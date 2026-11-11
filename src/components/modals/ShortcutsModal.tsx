import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd + K / Ctrl + K', desc: 'Open Command & Search Palette' },
    { key: 'Cmd + / / Ctrl + /', desc: 'Open Keyboard Shortcuts cheat sheet' },
    { key: '/', desc: 'Trigger Slash Block Commands in Editor' },
    { key: '[[', desc: 'Trigger Wikilink Auto-suggest in Editor' },
    { key: '- [ ]', desc: 'Create interactive checklist item' },
    { key: 'Esc', desc: 'Close any active modal or popover' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in text-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e5e5e5] dark:border-[#262626] mb-4">
          <div className="flex items-center space-x-2 font-heading font-semibold text-sm text-black dark:text-white">
            <Command size={15} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#737373] hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#fafafa] dark:bg-[#202020] border border-[#e5e5e5] dark:border-[#2e2e2e]"
            >
              <span className="text-[#525252] dark:text-[#d4d4d4]">{s.desc}</span>
              <kbd className="font-mono text-[11px] bg-white dark:bg-[#282828] border border-[#e5e5e5] dark:border-[#333] px-2 py-0.5 rounded-full text-black dark:text-white font-medium">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
