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
  Layout,
  Share2,
  X
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

  const handleNodeMouseDown = (node: CanvasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: (e.clientX - pan.x) / zoom - node.x,
      y: (e.clientY - pan.y) / zoom - node.y,
    });
  };

  const handleAddCard = (type: 'card' | 'sticky' | 'page') => {
    const pages = storage.getPages();
    const firstPage = pages[0];

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      boardId: canvas.id,
      type,
      title: type === 'page' ? (firstPage?.title || 'Linked Note') : type === 'sticky' ? 'Quick Note' : 'System Module',
      content: type === 'sticky' ? 'Record thoughts here.' : 'Modular architecture node.',
      pageId: type === 'page' ? firstPage?.id : undefined,
      x: Math.round((-pan.x + 300) / zoom + Math.random() * 60),
      y: Math.round((-pan.y + 200) / zoom + Math.random() * 60),
      width: 250,
      height: 130,
      color: type === 'sticky' ? '#fef08a' : '#ffffff',
    };

    onUpdateCanvas({ nodes: [...canvas.nodes, newNode] });
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = canvas.nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = canvas.edges.filter((e) => e.fromId !== nodeId && e.toId !== nodeId);
    onUpdateCanvas({ nodes: updatedNodes, edges: updatedEdges });
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleUpdateNodeContent = (nodeId: string, updates: Partial<CanvasNode>) => {
    const updatedNodes = canvas.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n));
    onUpdateCanvas({ nodes: updatedNodes });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownContainer}
      onMouseMove={handleMouseMoveContainer}
      onMouseUp={handleMouseUpContainer}
      className="flex-1 w-full h-full relative overflow-hidden bg-[#fafafa] dark:bg-[#141414] select-none cursor-grab active:cursor-grabbing transition-colors"
    >
      {/* Top Floating Pill Toolbar */}
      <div className="absolute top-4 left-6 flex items-center space-x-2 z-20 pointer-events-auto">
        <button
          onClick={() => handleAddCard('card')}
          className="btn-pill btn-pill-sm shadow-sm"
        >
          <Plus size={11} />
          <span>Card</span>
        </button>

        <button
          onClick={() => handleAddCard('sticky')}
          className="btn-pill btn-pill-sm shadow-sm"
        >
          <StickyNote size={11} />
          <span>Sticky</span>
        </button>

        <button
          onClick={() => handleAddCard('page')}
          className="btn-pill btn-pill-sm shadow-sm"
        >
          <FileText size={11} />
          <span>Doc Link</span>
        </button>

        <div className="h-4 w-[1px] bg-[#e5e5e5] dark:border-[#333] mx-1" />

        <button
          onClick={() => setZoom((z) => Math.min(2, z * 1.2))}
          className="btn-pill btn-pill-sm"
          title="Zoom In"
        >
          <ZoomIn size={12} />
        </button>

        <button
          onClick={() => setZoom((z) => Math.max(0.4, z * 0.8))}
          className="btn-pill btn-pill-sm"
          title="Zoom Out"
        >
          <ZoomOut size={12} />
        </button>

        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="btn-pill btn-pill-sm"
          title="Reset Canvas Pan & Zoom"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Canvas Viewport */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        {/* SVG Connectors / Edges */}
        <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none">
          {canvas.edges.map((edge) => {
            const fromNode = canvas.nodes.find((n) => n.id === edge.fromId);
            const toNode = canvas.nodes.find((n) => n.id === edge.toId);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x + fromNode.width / 2;
            const y1 = fromNode.y + fromNode.height / 2;
            const x2 = toNode.x + toNode.width / 2;
            const y2 = toNode.y + toNode.height / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#a3a3a3"
                  strokeWidth="1.5"
                  strokeDasharray={edge.style === 'dashed' ? '4 4' : undefined}
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    fill="#737373"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Canvas Nodes */}
        {canvas.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(node, e)}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                width: `${node.width}px`,
                minHeight: `${node.height}px`,
              }}
              className={`canvas-card absolute pointer-events-auto rounded-2xl p-4 shadow-sm border transition-shadow cursor-move flex flex-col justify-between ${
                node.type === 'sticky'
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-black dark:text-amber-100 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-[#1e1e1e] text-black dark:text-white border-[#e5e5e5] dark:border-[#333]'
              } ${isSelected ? 'ring-2 ring-black dark:ring-white shadow-md' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#e5e5e5] dark:border-[#333]/50">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold truncate">
                    {node.type === 'page' && <FileText size={12} className="text-[#737373]" />}
                    {node.type === 'sticky' && <StickyNote size={12} className="text-amber-500" />}
                    {node.type === 'card' && <Layout size={12} className="text-[#737373]" />}
                    <input
                      type="text"
                      value={node.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleUpdateNodeContent(node.id, { title: e.target.value })}
                      className="bg-transparent font-medium focus:outline-none w-full truncate"
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="p-0.5 rounded text-[#a3a3a3] hover:text-red-500"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                <textarea
                  value={node.content || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleUpdateNodeContent(node.id, { content: e.target.value })}
                  placeholder="Notes or ideas..."
                  className="w-full bg-transparent text-xs resize-none focus:outline-none leading-relaxed min-h-[48px] placeholder:text-[#a3a3a3]"
                />
              </div>

              {node.type === 'page' && node.pageId && (
                <div className="pt-2 border-t border-[#e5e5e5] dark:border-[#333]/50 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToPage(node.pageId!);
                    }}
                    className="btn-pill btn-pill-sm text-[10px] w-full justify-center"
                  >
                    <ExternalLink size={10} />
                    <span>Open Note</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
