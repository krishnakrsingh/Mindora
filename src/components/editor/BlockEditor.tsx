import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  CheckSquare, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Table as TableIcon, 
  Sparkles, 
  Eye, 
  Edit3, 
  Columns, 
  Copy, 
  Download,
  ExternalLink,
  ArrowRight,
  Plus,
  X,
  Star,
  Check,
  FileCode,
  Info,
  AlertTriangle
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
  const [slashFilter, setSlashFilter] = useState('');
  const [wikilinkMenuOpen, setWikilinkMenuOpen] = useState(false);
  const [wikilinkQuery, setWikilinkQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [newTagInputOpen, setNewTagInputOpen] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

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

    if (lastLine.startsWith('/')) {
      setSlashMenuOpen(true);
      setSlashFilter(lastLine.slice(1).toLowerCase());
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

  // Insert template or block at cursor position
  const insertTextAtCursor = (textToInsert: string, replaceSlash = false) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let before = content.slice(0, start);
    let after = content.slice(end);

    if (replaceSlash) {
      const lastSlashIdx = before.lastIndexOf('/');
      if (lastSlashIdx >= 0) {
        before = before.slice(0, lastSlashIdx);
      }
    }

    const updated = before + textToInsert + after;
    setContent(updated);
    triggerAutoSave(title, updated);
    setSlashMenuOpen(false);
    setWikilinkMenuOpen(false);

    setTimeout(() => {
      textarea.focus();
      const newCursor = before.length + textToInsert.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 50);
  };

  // Toggle checklist checkbox directly inside markdown
  const handleToggleCheckbox = (lineIndex: number) => {
    const lines = content.split('\n');
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      if (line.includes('- [ ]')) {
        lines[lineIndex] = line.replace('- [ ]', '- [x]');
      } else if (line.includes('- [x]')) {
        lines[lineIndex] = line.replace('- [x]', '- [ ]');
      }
      const updated = lines.join('\n');
      setContent(updated);
      triggerAutoSave(title, updated);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (!newTagText.trim()) return;
    const clean = newTagText.trim().replace(/^#/, '').toLowerCase();
    const existing = page.tags || [];
    if (!existing.includes(clean)) {
      onUpdatePage({ tags: [...existing, clean] });
    }
    setNewTagText('');
    setNewTagInputOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const existing = page.tags || [];
    onUpdatePage({ tags: existing.filter((t) => t !== tagToRemove) });
  };

  // Execute AI action on document
  const handleAiAction = async (action: 'improve' | 'summarize' | 'outline' | 'tasks' | 'explain') => {
    setIsAiProcessing(true);
    try {
      const prompt = content.slice(0, 3000);
      const res = await aiService.executeInlineAction(action, prompt);
      if (res && res.trim()) {
        const appended = `${content}\n\n---\n\n### Mindora AI (${action.toUpperCase()})\n\n${res}`;
        setContent(appended);
        triggerAutoSave(title, appended);
      }
    } catch (err: any) {
      console.error('AI Inline Action failed:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Word count and reading time
  const wordCount = content.trim().length > 0 ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Backlinks
  const backlinks = graphService.getBacklinks(page.title);

  // Available pages for wikilink autocomplete
  const allPages = storage.getPages();
  const filteredWikilinkPages = allPages.filter(
    (p) => p.id !== page.id && p.title.toLowerCase().includes(wikilinkQuery.toLowerCase())
  );

  // Slash commands registry
  const slashCommands = [
    { title: 'Heading 1', desc: 'Large section heading', icon: Heading1, action: () => insertTextAtCursor('\n# ', true) },
    { title: 'Heading 2', desc: 'Medium section heading', icon: Heading2, action: () => insertTextAtCursor('\n## ', true) },
    { title: 'Heading 3', desc: 'Small section heading', icon: Heading3, action: () => insertTextAtCursor('\n### ', true) },
    { title: 'To-do List', desc: 'Interactive task checklist', icon: CheckSquare, action: () => insertTextAtCursor('\n- [ ] ', true) },
    { title: 'Bullet List', desc: 'Simple bulleted list', icon: List, action: () => insertTextAtCursor('\n- ', true) },
    { title: 'Code Block', desc: 'Monospace code block', icon: Code, action: () => insertTextAtCursor('\n```typescript\n\n```', true) },
    { title: 'Callout Note', desc: 'Highlighted alert box', icon: Info, action: () => insertTextAtCursor('\n> [!NOTE]\n> Enter important note here.\n', true) },
    { title: 'Table', desc: 'Structured markdown table', icon: TableIcon, action: () => insertTextAtCursor('\n| Column 1 | Column 2 |\n|---|---|\n| Item 1 | Item 2 |\n', true) },
    { title: 'Mermaid Diagram', desc: 'Flowchart or architecture map', icon: FileCode, action: () => insertTextAtCursor('\n```mermaid\ngraph TD\nA[Client] --> B[Mindora Engine]\nB --> C[Ollama / Local AI]\n```\n', true) },
    { title: 'Divider', desc: 'Visual horizontal line', icon: Edit3, action: () => insertTextAtCursor('\n---\n', true) },
  ];

  const filteredSlashCommands = slashCommands.filter(
    (c) => c.title.toLowerCase().includes(slashFilter) || c.desc.toLowerCase().includes(slashFilter)
  );

  // Interactive Markdown Renderer
  const renderInteractiveMarkdown = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start / end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.replace(/^```/, '').trim() || 'text';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const fullCode = codeBuffer.join('\n');
          const codeId = `code-${i}`;

          if (codeLanguage === 'mermaid') {
            elements.push(
              <div key={`mermaid-${i}`} className="my-4">
                <MermaidRenderer code={fullCode} />
              </div>
            );
          } else {
            elements.push(
              <div key={codeId} className="terminal-card my-4 relative group">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e5e5e5] dark:border-[#2e2e2e]">
                  <div className="terminal-traffic-lights">
                    <div className="traffic-light traffic-red" />
                    <div className="traffic-light traffic-yellow" />
                    <div className="traffic-light traffic-green" />
                    <span className="text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3] ml-2">
                      {codeLanguage}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(fullCode);
                      setCopiedCodeId(codeId);
                      setTimeout(() => setCopiedCodeId(null), 1500);
                    }}
                    className="btn-pill btn-pill-sm text-[10px]"
                  >
                    {copiedCodeId === codeId ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    <span>{copiedCodeId === codeId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs font-mono leading-relaxed text-black dark:text-white">
                  <code>{fullCode}</code>
                </pre>
              </div>
            );
          }
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="font-heading text-2xl font-bold mt-6 mb-3 text-black dark:text-white">
            {line.replace(/^# /, '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="font-heading text-xl font-semibold mt-5 mb-2.5 text-black dark:text-white">
            {line.replace(/^## /, '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="font-heading text-lg font-semibold mt-4 mb-2 text-black dark:text-white">
            {line.replace(/^### /, '')}
          </h3>
        );
      }
      // Horizontal Rule
      else if (line.trim() === '---') {
        elements.push(<hr key={i} className="my-6 border-[#e5e5e5] dark:border-[#2e2e2e]" />);
      }
      // Interactive Checkbox
      else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const isChecked = line.startsWith('- [x] ');
        const itemText = line.replace(/^- \[[ x]\] /, '');
        elements.push(
          <div key={i} className="flex items-center space-x-2.5 my-1.5 group">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleToggleCheckbox(i)}
              className="w-4 h-4 rounded border-[#d4d4d4] dark:border-[#404040] accent-black dark:accent-white cursor-pointer"
            />
            <span className={`text-[14px] leading-relaxed transition-all ${isChecked ? 'line-through text-[#a3a3a3]' : 'text-black dark:text-white'}`}>
              {renderInlineSpans(itemText)}
            </span>
          </div>
        );
      }
      // Bullet items
      else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="ml-5 list-disc text-[14px] leading-relaxed my-1 text-black dark:text-white">
            {renderInlineSpans(line.replace(/^- /, ''))}
          </li>
        );
      }
      // Callout box
      else if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]') || line.startsWith('> [!WARNING]')) {
        const type = line.includes('WARNING') ? 'warning' : line.includes('TIP') ? 'tip' : 'note';
        elements.push(
          <div 
            key={i} 
            className={`my-3 p-3.5 rounded-xl border border-l-4 text-xs leading-relaxed ${
              type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 border-l-amber-500 text-amber-900 dark:text-amber-200'
                : 'bg-[#fafafa] dark:bg-[#1e1e1e] border-[#e5e5e5] dark:border-[#2e2e2e] border-l-black dark:border-l-white text-black dark:text-white'
            }`}
          >
            <div className="font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
              {type === 'warning' ? <AlertTriangle size={12} /> : <Info size={12} />}
              <span>{type}</span>
            </div>
            <div>{renderInlineSpans(lines[i + 1]?.replace(/^>\s*/, '') || '')}</div>
          </div>
        );
        i++; // skip next line as part of callout
      }
      // Standard Paragraph
      else if (line.trim().length > 0) {
        elements.push(
          <p key={i} className="text-[14px] leading-relaxed my-2 text-[#525252] dark:text-[#d4d4d4]">
            {renderInlineSpans(line)}
          </p>
        );
      }
    }

    return elements;
  };

  // Parses inline `[[Wikilinks]]`, `**bold**`, `*italic*`, and `` `code` ``
  const renderInlineSpans = (text: string): React.ReactNode => {
    const parts = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, idx) => {
      // Wikilink
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const linkTarget = part.slice(2, -2).trim();
        return (
          <button
            key={idx}
            onClick={() => onNavigateToPage(linkTarget)}
            className="inline-flex items-center gap-1 font-medium text-black dark:text-white underline decoration-[#a3a3a3] hover:decoration-black dark:hover:decoration-white transition-all cursor-pointer mx-0.5"
            title={`Jump to note: ${linkTarget}`}
          >
            <span>{linkTarget}</span>
          </button>
        );
      }

      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-black dark:text-white">{part.slice(2, -2)}</strong>;
      }

      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#333] text-black dark:text-white mx-0.5">
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#171717] select-text transition-colors">
      {/* Document Top Bar & Metadata */}
      <div className="h-12 border-b border-[#e5e5e5] dark:border-[#262626] px-6 flex items-center justify-between select-none">
        {/* Left: Editor View Mode Switcher Pills */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 p-0.5 rounded-full border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#1f1f1f]">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                editorMode === 'visual'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setEditorMode('split')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                editorMode === 'split'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setEditorMode('read')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                editorMode === 'read'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#737373] dark:text-[#a3a3a3] font-mono ml-2">
            <span className={`inline-block w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
            <span>{saveStatus === 'saved' ? 'Saved' : 'Autosaving...'}</span>
          </div>
        </div>

        {/* Right: Word Count, AI Assist & Export Actions */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 font-mono text-[11px] text-[#737373] dark:text-[#a3a3a3] mr-2">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>~{readingTime} min read</span>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
              alert('Markdown content copied to clipboard.');
            }}
            className="btn-pill btn-pill-sm"
            title="Copy Raw Markdown"
          >
            <Copy size={11} />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            onClick={() => {
              const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'note'}.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-pill btn-pill-sm"
            title="Download .md file"
          >
            <Download size={11} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto px-6 md:px-16 py-8 max-w-4xl mx-auto w-full">
        {/* Document Title Header */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="w-full bg-transparent font-heading text-3xl font-bold tracking-tight text-black dark:text-white focus:outline-none placeholder:text-[#a3a3a3]"
          />
        </div>

        {/* Tags Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          {(page.tags || []).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#fafafa] dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#333] text-[#525252] dark:text-[#d4d4d4]"
            >
              <span>#{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {newTagInputOpen ? (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="tag name"
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                  if (e.key === 'Escape') setNewTagInputOpen(false);
                }}
                className="px-2 py-0.5 text-xs rounded-full border border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none w-24"
              />
              <button onClick={handleAddTag} className="btn-pill btn-pill-sm">
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setNewTagInputOpen(true)}
              className="btn-pill btn-pill-sm text-[11px]"
            >
              <Plus size={10} />
              <span>Tag</span>
            </button>
          )}

          {/* Quick AI Action Pills */}
          <div className="ml-auto hidden md:flex items-center space-x-1.5">
            <button
              disabled={isAiProcessing}
              onClick={() => handleAiAction('improve')}
              className="btn-pill btn-pill-sm text-[11px] hover:border-black dark:hover:border-white"
              title="Polish writing clarity and flow"
            >
              <Sparkles size={11} />
              <span>{isAiProcessing ? 'Thinking...' : 'Polish'}</span>
            </button>
            <button
              disabled={isAiProcessing}
              onClick={() => handleAiAction('summarize')}
              className="btn-pill btn-pill-sm text-[11px]"
              title="Summarize key points"
            >
              Summarize
            </button>
            <button
              disabled={isAiProcessing}
              onClick={() => handleAiAction('tasks')}
              className="btn-pill btn-pill-sm text-[11px]"
              title="Extract tasks to checklists"
            >
              Tasks
            </button>
          </div>
        </div>

        {/* Editor Writing Surface */}
        {editorMode === 'visual' && (
          <div className="space-y-6 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Type '/' for commands, '[[' to link notes, or write in Markdown..."
              className="w-full min-h-[420px] bg-transparent text-black dark:text-white font-sans text-[15px] leading-relaxed resize-none focus:outline-none placeholder:text-[#a3a3a3]"
            />

            {/* Live Rendered Preview Section */}
            <div className="pt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-3">
                Live Interactive View
              </div>
              <div className="p-6 rounded-2xl border border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#1a1a1a]">
                {renderInteractiveMarkdown(content)}
              </div>
            </div>
          </div>
        )}

        {editorMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px] relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Write Markdown..."
              className="w-full h-full p-4 rounded-xl border border-[#e5e5e5] dark:border-[#262626] bg-transparent text-black dark:text-white font-mono text-xs leading-relaxed resize-none focus:outline-none"
            />
            <div className="p-4 rounded-xl border border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#1a1a1a] overflow-y-auto max-h-[650px]">
              {renderInteractiveMarkdown(content)}
            </div>
          </div>
        )}

        {editorMode === 'read' && (
          <div className="py-4 leading-relaxed">
            {renderInteractiveMarkdown(content)}
          </div>
        )}

        {/* Slash Command Popover Menu */}
        {slashMenuOpen && (
          <div className="absolute left-16 top-64 bg-white dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#333] rounded-2xl shadow-xl p-2 w-64 z-50 animate-fade-in">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#a3a3a3] px-2.5 py-1">
              Insert Block
            </div>
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredSlashCommands.map((cmd) => {
                const IconComponent = cmd.icon;
                return (
                  <button
                    key={cmd.title}
                    onClick={cmd.action}
                    className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] text-black dark:text-white transition-colors"
                  >
                    <IconComponent size={14} className="text-[#737373] flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-medium text-xs truncate">{cmd.title}</div>
                      <div className="text-[10px] text-[#737373] truncate">{cmd.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Wikilink Auto-suggest Popover */}
        {wikilinkMenuOpen && (
          <div className="absolute left-20 top-72 bg-white dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#333] rounded-2xl shadow-xl p-2 w-72 z-50 animate-fade-in">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#a3a3a3] px-2.5 py-1">
              Link to Note
            </div>
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredWikilinkPages.length > 0 ? (
                filteredWikilinkPages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      insertTextAtCursor(`${p.title}]]`, false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] text-black dark:text-white transition-colors"
                  >
                    <span>{p.icon || '📄'}</span>
                    <span className="font-medium text-xs truncate flex-1">{p.title}</span>
                  </button>
                ))
              ) : (
                <div className="px-2.5 py-2 text-xs text-[#737373]">
                  No matching notes. Press Space or Esc.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linked Backlinks Section */}
        {backlinks.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-3">
              Linked Backlinks ({backlinks.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {backlinks.map((bl) => (
                <div
                  key={bl.id}
                  onClick={() => onNavigateToPage(bl.title)}
                  className="p-3.5 rounded-xl border border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#1a1a1a] hover:border-black dark:hover:border-white cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-1.5 text-xs text-black dark:text-white font-medium group-hover:underline">
                    <ArrowRight size={12} className="text-[#737373]" />
                    <span>{bl.title}</span>
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] mt-1 line-clamp-2">
                    {bl.excerpt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
