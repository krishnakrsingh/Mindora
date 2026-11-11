import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  FileArchive,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { storage } from '../../services/storage';
import { backupService } from '../../services/backup';

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
  const [activeTab, setActiveTab] = useState<'import' | 'backup'>('import');
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [backupVerified, setBackupVerified] = useState<boolean | null>(null);

  if (!isOpen) return null;

  // Obsidian Markdown files import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let count = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          storage.importVaultMarkdown(file.name, content);
          count++;
          if (count === files.length) {
            setImportedCount(count);
            onRefreshWorkspace();
          }
        }
      };
      reader.readAsText(file);
    });
  };

  // Create & download signed backup package
  const handleDownloadBackup = () => {
    const backupPkg = backupService.createBackup();
    const jsonStr = JSON.stringify(backupPkg, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore backup from JSON
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const isValid = backupService.verifyBackup(parsed);
        setBackupVerified(isValid);

        if (isValid && parsed.data) {
          if (parsed.data.pages) {
            parsed.data.pages.forEach((p: any) => {
              if (!storage.getPage(p.id)) {
                storage.createPage(p.title, p.content, p.parentId);
              }
            });
          }
          onRefreshWorkspace();
        }
      } catch {
        setBackupVerified(false);
      }
    };
    reader.readAsText(file);
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
            <FileArchive size={15} />
            <span>Vault Import & Workspace Snapshot</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#737373] hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center space-x-1 p-0.5 rounded-full border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#202020] mb-5 w-fit">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeTab === 'import'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
            }`}
          >
            Obsidian Import (.md)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeTab === 'backup'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
            }`}
          >
            Snapshot & Backup
          </button>
        </div>

        {/* Obsidian Markdown Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-dashed border-[#d4d4d4] dark:border-[#3f3f3f] bg-[#fafafa] dark:bg-[#202020] text-center">
              <Upload size={24} className="mx-auto text-[#737373] mb-2" />
              <div className="font-semibold text-xs text-black dark:text-white mb-1">
                Upload Markdown Files
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] mb-3">
                Supports Obsidian vaults with YAML frontmatter, tags, and Wikilinks.
              </div>

              <label className="btn-pill btn-pill-primary cursor-pointer inline-flex">
                <span>Select .md Files</span>
                <input
                  type="file"
                  multiple
                  accept=".md,.markdown,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importedCount !== null && (
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 size={14} />
                <span>Successfully imported {importedCount} document(s) into workspace.</span>
              </div>
            )}
          </div>
        )}

        {/* Snapshot & Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#202020] space-y-3">
              <div className="font-semibold text-xs text-black dark:text-white">
                Create Integrity-Signed Snapshot
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] leading-relaxed">
                Generates a complete workspace JSON backup verified with SHA-256 data checksums.
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={13} />
                <span>Verified: Secret API keys are strictly excluded from backup packages.</span>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="btn-pill btn-pill-primary w-full justify-center"
              >
                <Download size={12} />
                <span>Export Signed Workspace Package</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#202020] space-y-3">
              <div className="font-semibold text-xs text-black dark:text-white">
                Restore from Backup JSON
              </div>
              <label className="btn-pill w-full justify-center cursor-pointer">
                <Upload size={12} />
                <span>Verify & Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>

              {backupVerified === true && (
                <div className="flex items-center space-x-1.5 text-emerald-500 font-medium text-[11px]">
                  <CheckCircle2 size={13} />
                  <span>Integrity verified! Backup successfully restored.</span>
                </div>
              )}
              {backupVerified === false && (
                <div className="flex items-center space-x-1.5 text-red-500 font-medium text-[11px]">
                  <AlertCircle size={13} />
                  <span>Invalid or tampered backup package checksum.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
