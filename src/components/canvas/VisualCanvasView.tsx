import React, { useState, useRef } from 'react';
import { 
  Plus, 
  FileText, 
  StickyNote, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Trash2, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { CanvasBoard, CanvasNode, CanvasEdge } from '../../types';
import { storage } from '../../services/storage';

interface VisualCanvasViewProps {
  canvas: CanvasBoard;
  onUpdateCanvas: (updates: Partial<CanvasBoard>) => void;
  onNavigateToPage: (pageId: string) => void;
}

export const VisualCanvasView: React.FC<VisualCanvasViewProps> = ({
  canvas,
  onUpdateCanvas,
  onNavigateToPage,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastPanPos = useRef({ x: 0, y: 0 });

  // Pan canvas
  const handleMouseDownContainer = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-card')) return;
    setIsPanning(true);
    lastPanPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMoveContainer = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    if (draggingNodeId) {
      const updatedNodes = canvas.nodes.map((node) => {
        if (node.id === draggingNodeId) {
          return {
            ...node,
            x: Math.round((e.clientX - pan.x) / zoom - dragOffset.x),
            y: Math.round((e.clientY - pan.y) / zoom - dragOffset.y),
          };
        }
        return node;
      });
      onUpdateCanvas({ nodes: updatedNodes });
    }
  };

  const handleMouseUpContainer = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node drag start
  const handleNodeMouseDown = (node: CanvasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: (e.clientX - pan.x) / zoom - node.x,
      y: (e.clientY - pan.y) / zoom - node.y,
    });
  };

  // Add new card
  const handleAddCard = (type: 'card' | 'sticky' | 'page') => {
    const pages = storage.getPages();
    const firstPage = pages[0];

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      boardId: canvas.id,
      type,
      title: type === 'page' ? (firstPage?.title || 'Linked Note') : type === 'sticky' ? 'Quick Thought' : 'Architecture Component',
      content: type === 'sticky' ? 'Double click or edit thoughts here.' : 'Modular component description.',
      pageId: type === 'page' ? firstPage?.id : undefined,
      x: Math.round((-pan.x + 300) / zoom + Math.random() * 80),
      y: Math.round((-pan.y + 200) / zoom + Math.random() * 80),
      width: 240,
      height: 120,
      color: type === 'sticky' ? '#CA8A04' : type === 'page' ? '#0284C7' : '#4F46E5',
    };

    onUpdateCanvas({ nodes: [...canvas.nodes, newNode] });
  };

  // Delete node
  const handleDeleteNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newNodes = canvas.nodes.filter((n) => n.id !== nodeId);
    const newEdges = canvas.edges.filter((ed) => ed.fromId !== nodeId && ed.toId !== nodeId);
    onUpdateCanvas({ nodes: newNodes, edges: newEdges });
  };

  // Render SVG edge lines
  const renderEdges = () => {
    return canvas.edges.map((edge) => {
      const fromNode = canvas.nodes.find((n) => n.id === edge.fromId);
      const toNode = canvas.nodes.find((n) => n.id === edge.toId);
      if (!fromNode || !toNode) return null;

      const x1 = fromNode.x + fromNode.width / 2;
      const y1 = fromNode.y + fromNode.height / 2;
      const x2 = toNode.x + toNode.width / 2;
      const y2 = toNode.y + toNode.height / 2;

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const path = `M ${x1} ${y1} Q ${midX} ${midY - 20} ${x2} ${y2}`;

      return (
        <g key={edge.id}>
          <path
            d={path}
            stroke="#818CF8"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#canvas-arrow)"
            strokeDasharray={edge.style === 'dashed' ? '5,5' : 'none'}
            opacity="0.7"
          />
          {edge.label && (
            <text
              x={midX}
              y={midY - 15}
              fill="#CBD5E1"
              fontSize="10"
              fontFamily="Plus Jakarta Sans"
              textAnchor="middle"
              className="bg-[#121318] px-1 select-none"
            >
              {edge.label}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownContainer}
      onMouseMove={handleMouseMoveContainer}
      onMouseUp={handleMouseUpContainer}
      className="flex-1 h-full bg-[#0b0c10] overflow-hidden relative select-none cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <svg className="absolute inset-0 pointer-events-none w-0 h-0">
        <defs>
          <marker id="canvas-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#818CF8" />
          </marker>
        </defs>
      </svg>
      {/* Canvas Top Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-[#161822]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl text-xs">
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/5 rounded-lg text-slate-300 font-semibold">
          <span>🗺️</span>
          <span>{canvas.title}</span>
        </div>

        <button
          onClick={() => handleAddCard('card')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors"
        >
          <Plus size={13} />
          <span>Add Block</span>
        </button>

        <button
          onClick={() => handleAddCard('sticky')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-sm transition-colors"
        >
          <StickyNote size={13} />
          <span>Sticky Note</span>
        </button>

        <button
          onClick={() => handleAddCard('page')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm transition-colors"
        >
          <FileText size={13} />
          <span>Link Document</span>
        </button>
      </div>

      {/* Canvas Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col space-y-1.5 bg-[#161822]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          title="Reset View"
        >
          <RotateCcw size={15} />
        </button>
        <div className="text-[10px] text-center font-mono text-slate-400 py-0.5 border-t border-white/5 select-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Infinite Transform Container */}
      <div
        className="w-full h-full absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Bezier Lines */}
        <svg className="w-[8000px] h-[8000px] absolute inset-0 pointer-events-none">
          {renderEdges()}
        </svg>

        {/* Canvas Cards */}
        {canvas.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(node, e)}
              className="canvas-card absolute pointer-events-auto rounded-xl p-4 shadow-2xl transition-shadow select-none group border border-white/10 hover:border-white/20"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                backgroundColor: '#161823',
                borderLeft: `4px solid ${node.color || '#4F46E5'}`,
                boxShadow: isSelected ? '0 0 0 2px #818CF8, 0 10px 25px -5px rgba(0,0,0,0.5)' : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white truncate max-w-[170px]">
                  {node.title}
                </span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {node.pageId && (
                    <button
                      onClick={() => onNavigateToPage(node.pageId!)}
                      className="p-1 hover:text-indigo-400 text-slate-400"
                      title="Open full document"
                    >
                      <ExternalLink size={12} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteNode(node.id, e)}
                    className="p-1 hover:text-rose-400 text-slate-400"
                    title="Delete card"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {node.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

