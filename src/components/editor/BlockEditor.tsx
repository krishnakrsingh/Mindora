import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Table, 
  Sparkles, 
  Eye, 
  Edit3, 
  Columns, 
  Check, 
  Copy, 
  ExternalLink,
  Info,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Page } from '../../types';
import { storage } from '../../services/storage';
import { graphService } from '../../services/graph';
import { aiService } from '../../services/ai';
import { MermaidRenderer } from '../diagrams/MermaidRenderer';

interface BlockEditorProps {
  page: Page;
  onUpdatePage: (updates: Partial<Page>) => void;
  onNavigateToPage: (title: string) => void;
  onRequestAiInline: (action: 'improve' | 'summarize' | 'outline' | 'tasks' | 'explain', selectedText: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  page,
  onUpdatePage,
  onNavigateToPage,
  onRequestAiInline,
}) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [editorMode, setEditorMode] = useState<'visual' | 'split' | 'read'>('visual');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [wikilinkMenuOpen, setWikilinkMenuOpen] = useState(false);
  const [wikilinkQuery, setWikilinkQuery] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionToolbarPos, setSelectionToolbarPos] = useState<{ top: number; left: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setTitle(page.title);
    setContent(page.content);
  }, [page.id]);

  // Debounced auto-save
  const triggerAutoSave = (newTitle: string, newContent: string) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      onUpdatePage({ title: newTitle, content: newContent });
      setSaveStatus('saved');
    }, 400);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutoSave(val, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    triggerAutoSave(title, val);

    // Detect slash command
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const lastLine = textBeforeCursor.split('\n').pop() || '';

    if (lastLine.endsWith('/')) {
      setSlashMenuOpen(true);
      setSlashMenuPos({ top: 120, left: 60 });
    } else {
      setSlashMenuOpen(false);
    }

    // Detect wikilink auto-complete
    const wikilinkMatch = textBeforeCursor.match(/\[\[([^\]]*)$/);
    if (wikilinkMatch) {
      setWikilinkMenuOpen(true);
      setWikilinkQuery(wikilinkMatch[1]);
    } else {
      setWikilinkMenuOpen(false);
    }
  };

  // Handle selection for floating AI bar
  const handleSelectText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end && end - start > 3) {
      const selected = textarea.value.slice(start, end);
      setSelectedText(selected);
      setSelectionToolbarPos({ top: 70, left: 180 });
    } else {
      setSelectedText('');
      setSelectionToolbarPos(null);
    }
  };

  // Insert slash command action
  const executeSlashCommand = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursor = textarea.selectionStart;
    const before = content.slice(0, cursor);
    const after = content.slice(cursor);

    // Remove the trailing '/'
    const cleanBefore = before.endsWith('/') ? before.slice(0, -1) : before;
    const newContent = cleanBefore + snippet + after;
    setContent(newContent);
    triggerAutoSave(title, newContent);
    setSlashMenuOpen(false);

    setTimeout(() => {
      textarea.focus();
      const newCursor = cleanBefore.length + snippet.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 50);
  };

  // Insert selected wikilink
  const insertWikilink = (targetTitle: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursor = textarea.selectionStart;
    const before = content.slice(0, cursor);
    const after = content.slice(cursor);

    const match = before.match(/\[\[([^\]]*)$/);
    if (match) {
      const replaceStart = match.index!;
      const newContent = content.slice(0, replaceStart) + `[[${targetTitle}]] ` + after;
      setContent(newContent);
      triggerAutoSave(title, newContent);
      setWikilinkMenuOpen(false);
    }
  };

  // Interactive checkbox toggler in preview
  const toggleCheckbox = (lineIndex: number) => {
    const lines = content.split('\n');
    const line = lines[lineIndex];
    if (!line) return;

    if (line.includes('- [ ]')) {
      lines[lineIndex] = line.replace('- [ ]', '- [x]');
    } else if (line.includes('- [x]')) {
      lines[lineIndex] = line.replace('- [x]', '- [ ]');
    }
    const newContent = lines.join('\n');
    setContent(newContent);
    triggerAutoSave(title, newContent);
  };

  // Backlinks for active page
  const backlinks = graphService.getBacklinks(page.id);
  const allWorkspacePages = storage.getPages();
  const filteredWikilinkSuggestions = allWorkspacePages.filter((p) =>
    p.title.toLowerCase().includes(wikilinkQuery.toLowerCase())
  );

  // Markdown renderer with interactive widgets
  const renderInteractiveMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace(/^```/, '').trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeText = codeBuffer.join('\n');
          if (codeLang.toLowerCase() === 'mermaid') {
            elements.push(
              <div key={`mermaid-${index}`} className="my-3">
                <div className="flex items-center justify-between px-3 py-1 bg-white/5 border border-white/10 rounded-t-lg text-xs text-indigo-400 font-mono">
                  <span>Diagram (Mermaid)</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeText)}
                    className="flex items-center space-x-1 hover:text-white"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>
                </div>
                <MermaidRenderer code={codeText} isDark={true} />
              </div>
            );
          } else {
            elements.push(
              <div key={`code-${index}`} className="my-3 rounded-lg overflow-hidden border border-white/10 bg-[#161821]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5 text-xs text-slate-400">
                  <span className="font-mono text-[11px]">{codeLang || 'plaintext'}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeText)}
                    className="flex items-center space-x-1 hover:text-white"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{codeText}</code>
                </pre>
              </div>
            );
          }
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Checkboxes
      if (/^\s*-\s*\[([ x])\]/.test(line)) {
        const isChecked = /^\s*-\s*\[x\]/.test(line);
        const taskText = line.replace(/^\s*-\s*\[([ x])\]\s*/, '');
        elements.push(
          <div key={`todo-${index}`} className="flex items-start space-x-2.5 my-1.5 text-sm group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleCheckbox(index)}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-white/5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className={isChecked ? 'line-through text-slate-500' : 'text-slate-200'}>
              {renderInlineSpans(taskText)}
            </span>
          </div>
        );
        return;
      }

      // Callouts (> ℹ️, > ⚠️, > 💡, > )
      if (line.startsWith('>')) {
        const calloutText = line.replace(/^>\s*/, '');
        let calloutType = 'info';
        let Icon = Info;
        let borderColor = 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300';

        if (calloutText.includes('⚠️') || calloutText.toLowerCase().includes('warning')) {
          Icon = AlertTriangle;
          borderColor = 'border-amber-500/30 bg-amber-500/10 text-amber-300';
        } else if (calloutText.includes('💡') || calloutText.toLowerCase().includes('tip')) {
          Icon = Lightbulb;
          borderColor = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
        }

        elements.push(
          <div key={`callout-${index}`} className={`my-3 p-3 rounded-lg border flex items-start space-x-3 text-sm ${borderColor}`}>
            <Icon size={18} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed text-slate-200">{renderInlineSpans(calloutText)}</div>
          </div>
        );
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1-${index}`} className="text-2xl font-bold mt-6 mb-2 text-white">{renderInlineSpans(line.slice(2))}</h1>);
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2-${index}`} className="text-xl font-bold mt-5 mb-2 text-slate-100">{renderInlineSpans(line.slice(3))}</h2>);
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3-${index}`} className="text-base font-semibold mt-4 mb-1.5 text-slate-200">{renderInlineSpans(line.slice(4))}</h3>);
        return;
      }

      // Bullet lists
      if (line.startsWith('- ')) {
        elements.push(
          <div key={`ul-${index}`} className="flex items-start space-x-2 my-1 text-sm text-slate-200 pl-2">
            <span className="text-indigo-400 font-bold">•</span>
            <span>{renderInlineSpans(line.slice(2))}</span>
          </div>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---') {
        elements.push(<hr key={`hr-${index}`} className="my-4 border-white/10" />);
        return;
      }

      // Blank line
      if (line.trim() === '') {
        elements.push(<div key={`blank-${index}`} className="h-2" />);
        return;
      }

      // Standard paragraph
      elements.push(
        <p key={`p-${index}`} className="text-sm text-slate-300 my-1.5 leading-relaxed">
          {renderInlineSpans(line)}
        </p>
      );
    });

    return elements;
  };

  // Parses inline Wikilinks [[Page]], bold, italic, code
  const renderInlineSpans = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\]|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
      // Wikilink
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const linkTitle = part.slice(2, -2).trim();
        return (
          <span
            key={i}
            onClick={() => onNavigateToPage(linkTitle)}
            className="inline-flex items-center space-x-0.5 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors border border-indigo-500/20 font-medium"
          >
            <span>{linkTitle}</span>
            <ExternalLink size={10} className="ml-0.5 opacity-60" />
          </span>
        );
      }
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      // Italic
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-200">{part.slice(1, -1)}</em>;
      }
      // Inline Code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-white/10 text-pink-300 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0e0f12] overflow-hidden select-text relative">
      {/* Editor Header Toolbar */}
      <div className="h-10 border-b border-white/5 px-6 flex items-center justify-between text-xs text-slate-400 bg-[#121318]/50">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved to local workspace'}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
          <span>•</span>
          <span>{content.length} characters</span>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-[#1a1b23] p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setEditorMode('visual')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded ${
              editorMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Interactive Visual Editor"
          >
            <Edit3 size={12} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setEditorMode('split')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded ${
              editorMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Side-by-side Markdown & Preview"
          >
            <Columns size={12} />
            <span>Split</span>
          </button>
          <button
            onClick={() => setEditorMode('read')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded ${
              editorMode === 'read' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Clean Reading Mode"
          >
            <Eye size={12} />
            <span>Read</span>
          </button>
        </div>
      </div>

      {/* Floating Text Selection AI Toolbar */}
      {selectionToolbarPos && selectedText && (
        <div
          className="absolute z-50 bg-[#1e2029] border border-indigo-500/40 rounded-lg shadow-2xl p-1 flex items-center space-x-1 animate-fade-in text-xs"
          style={{ top: `${selectionToolbarPos.top}px`, left: `${selectionToolbarPos.left}px` }}
        >
          <div className="flex items-center space-x-1 px-2 py-1 text-indigo-400 font-semibold border-r border-white/10">
            <Sparkles size={13} className="animate-pulse" />
            <span>Mindora AI</span>
          </div>
          <button
            onClick={() => onRequestAiInline('improve', selectedText)}
            className="px-2 py-1 hover:bg-white/10 rounded text-slate-200 transition-colors"
          >
            Improve
          </button>
          <button
            onClick={() => onRequestAiInline('summarize', selectedText)}
            className="px-2 py-1 hover:bg-white/10 rounded text-slate-200 transition-colors"
          >
            Summarize
          </button>
          <button
            onClick={() => onRequestAiInline('tasks', selectedText)}
            className="px-2 py-1 hover:bg-white/10 rounded text-slate-200 transition-colors"
          >
            Extract Tasks
          </button>
          <button
            onClick={() => onRequestAiInline('explain', selectedText)}
            className="px-2 py-1 hover:bg-white/10 rounded text-slate-200 transition-colors"
          >
            Explain
          </button>
        </div>
      )}

      {/* Slash Command Palette Menu */}
      {slashMenuOpen && (
        <div
          className="absolute z-50 w-64 bg-[#1e2029] border border-white/10 rounded-lg shadow-2xl p-1 animate-fade-in text-xs"
          style={{ top: `${slashMenuPos.top}px`, left: `${slashMenuPos.left}px` }}
        >
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Insert Block
          </div>
          <button
            onClick={() => executeSlashCommand('# ')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <Heading1 size={14} className="text-indigo-400" />
            <span>Heading 1</span>
          </button>
          <button
            onClick={() => executeSlashCommand('## ')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <Heading2 size={14} className="text-indigo-400" />
            <span>Heading 2</span>
          </button>
          <button
            onClick={() => executeSlashCommand('### ')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <Heading3 size={14} className="text-indigo-400" />
            <span>Heading 3</span>
          </button>
          <button
            onClick={() => executeSlashCommand('- [ ] ')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <CheckSquare size={14} className="text-emerald-400" />
            <span>Checklist / Todo</span>
          </button>
          <button
            onClick={() => executeSlashCommand('> ')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <Quote size={14} className="text-amber-400" />
            <span>Quote / Callout</span>
          </button>
          <button
            onClick={() => executeSlashCommand('```ts\n\n```')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <Code size={14} className="text-pink-400" />
            <span>Code Block</span>
          </button>
          <button
            onClick={() => executeSlashCommand('| Column 1 | Column 2 |\n|---|---|\n| Item 1 | Item 2 |')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <Table size={14} className="text-sky-400" />
            <span>Table</span>
          </button>
          <button
            onClick={() => executeSlashCommand('$$\nE = mc^2\n$$')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left"
          >
            <span className="font-mono text-xs text-purple-400 font-bold">fx</span>
            <span>Math LaTeX Equation</span>
          </button>
        </div>
      )}

      {/* Wikilink Auto-Complete Popup */}
      {wikilinkMenuOpen && (
        <div
          className="absolute z-50 w-72 bg-[#1e2029] border border-indigo-500/30 rounded-lg shadow-2xl p-1 animate-fade-in text-xs top-28 left-48"
        >
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
            Link to Workspace Document
          </div>
          {filteredWikilinkSuggestions.length === 0 ? (
            <div className="px-2 py-2 text-slate-500 italic">No matching pages found</div>
          ) : (
            filteredWikilinkSuggestions.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => insertWikilink(p.title)}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-white/10 text-slate-200 text-left truncate"
              >
                <span>{p.icon || '📄'}</span>
                <span className="truncate">{p.title}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Main Document Content Area */}
      <div className="flex-1 overflow-y-auto px-10 py-8 max-w-4xl w-full mx-auto">
        {/* Document Icon & Title */}
        <div className="mb-6">
          <div className="text-3xl mb-2 cursor-pointer">{page.icon || '📄'}</div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="w-full text-3xl font-extrabold bg-transparent border-none text-white focus:outline-none placeholder:text-slate-600 tracking-tight"
          />
        </div>

        {/* View Layouts */}
        {editorMode === 'visual' && (
          <div className="space-y-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleSelectText}
              placeholder="Type '/' for slash commands, '[[' for document links, or start writing..."
              className="w-full min-h-[350px] bg-transparent border-none text-slate-200 focus:outline-none resize-none font-sans text-sm leading-relaxed placeholder:text-slate-600"
            />
            <div className="border-t border-white/5 pt-6 mt-6">
              <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-3">
                Live Interactive Preview
              </div>
              <div className="bg-[#121318] p-5 rounded-xl border border-white/5">
                {renderInteractiveMarkdown(content)}
              </div>
            </div>
          </div>
        )}

        {editorMode === 'split' && (
          <div className="grid grid-cols-2 gap-6 min-h-[450px]">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleSelectText}
              placeholder="Write Markdown..."
              className="w-full h-full bg-[#121318] p-4 rounded-xl border border-white/5 text-slate-200 focus:outline-none resize-none font-mono text-xs leading-relaxed"
            />
            <div className="bg-[#121318] p-4 rounded-xl border border-white/5 overflow-y-auto">
              {renderInteractiveMarkdown(content)}
            </div>
          </div>
        )}

        {editorMode === 'read' && (
          <div className="prose prose-invert max-w-none">
            {renderInteractiveMarkdown(content)}
          </div>
        )}

        {/* Backlinks Section */}
        {backlinks.length > 0 && (
          <div className="mt-12 pt-6 border-t border-white/5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <span>Backlinks to this note ({backlinks.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {backlinks.map((bl) => (
                <div
                  key={bl.id}
                  onClick={() => onNavigateToPage(bl.title)}
                  className="p-3 rounded-lg bg-[#14161f] border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    <ArrowRight size={12} />
                    <span>{bl.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {bl.excerpt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Document Stats Footer */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>•</span>
            <span>~{Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200))} min read</span>
            <span>•</span>
            <span>{content.length} characters</span>
          </div>
          <div className="text-slate-600">
            Markdown v2.0
          </div>
        </div>
      </div>
    </div>
  );
};

