import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Archive
} from 'lucide-react';
import { storage } from '../../services/storage';

interface VaultImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshWorkspace: () => void;
}

export const VaultImportModal: React.FC<VaultImportModalProps> = ({
  isOpen,
  onClose,
  onRefreshWorkspace,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  // Handle Markdown file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let count = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const text = await file.text();
        storage.importVaultMarkdown(file.name, text);
        count++;
      }
    }

    setImportedCount(count);
    setImportStatus(`Successfully imported ${count} note(s) into your workspace!`);
    onRefreshWorkspace();
  };

  // Handle Workspace JSON Export
  const handleExportJson = () => {
    const dataStr = storage.exportWorkspaceData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindora-workspace-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
            <Archive size={18} className="text-indigo-400" />
            <span className="font-bold text-sm text-white">Vault Import & Export</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Import Obsidian Section */}
        <div className="space-y-4 mb-6">
          <div className="text-xs font-semibold text-slate-200">
            Import Obsidian Vault Notes (.md)
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Upload your existing Markdown files. Mindora preserves your folder hierarchy, frontmatter metadata, tags, and bidirectional <code className="text-indigo-300">[[wikilinks]]</code>.
          </p>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-6 cursor-pointer bg-white/[0.02] hover:bg-indigo-500/5 transition-all">
            <Upload size={24} className="text-indigo-400 mb-2" />
            <span className="text-xs font-semibold text-slate-200">Choose Markdown files</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Supports multiple .md files simultaneously</span>
            <input
              type="file"
              multiple
              accept=".md,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 size={15} />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="pt-4 border-t border-white/5">
          <div className="text-xs font-semibold text-slate-200 mb-2">
            Workspace Data Ownership & Portability
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
            You own 100% of your data. Export your entire workspace including all notes, relational databases, canvas boards, and graph relationships at any time.
          </p>

          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-md"
          >
            <Download size={14} />
            <span>Export Complete Workspace Bundle (.json)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

