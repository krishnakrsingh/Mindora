import React, { useEffect, useRef, useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Layers, 
  Info, 
  Share2,
  Search
} from 'lucide-react';
import { GraphData, GraphNode } from '../../types';
import { graphService } from '../../services/graph';

interface KnowledgeGraphViewProps {
  activePageId?: string;
  onNavigateToPage: (pageId: string) => void;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SimLink {
  source: SimNode;
  target: SimNode;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  activePageId,
  onNavigateToPage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localRadius, setLocalRadius] = useState<number>(0); // 0 = global, 1 = 1-hop, 2 = 2-hop
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<SimNode | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Fetch raw graph
    const data: GraphData = graphService.buildWorkspaceGraph(activePageId, localRadius);

    const width = window.innerWidth - 300;
    const height = window.innerHeight - 100;

    // 2. Initialize positions
    const nodeMap = new Map<string, SimNode>();
    const simNodes: SimNode[] = data.nodes.map((n, i) => {
      const angle = (i / Math.max(1, data.nodes.length)) * Math.PI * 2;
      const dist = 120 + Math.random() * 140;
      const radius = Math.max(8, Math.min(24, 7 + n.degree * 3.5));

      const simNode: SimNode = {
        ...n,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius,
      };
      nodeMap.set(n.id, simNode);
      return simNode;
    });

    const simLinks: SimLink[] = [];
    for (const link of data.links) {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (source && target) {
        simLinks.push({ source, target });
      }
    }

    simNodesRef.current = simNodes;
    simLinksRef.current = simLinks;

    // 3. Force-directed simulation loop
    let tick = 0;
    const runSimulation = () => {
      tick++;
      const nodes = simNodesRef.current;
      const links = simLinksRef.current;
      const cx = width / 2;
      const cy = height / 2;

      // Physics constants
      const repulsion = 450;
      const springLength = 110;
      const springStrength = 0.04;
      const centerStrength = 0.015;
      const damping = 0.88;

      // Node repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);

          if (dist < 400) {
            const force = repulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1 !== draggedNode) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2 !== draggedNode) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // Link attraction
      for (const link of links) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - springLength;
        const force = displacement * springStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (link.source !== draggedNode) {
          link.source.vx += fx;
          link.source.vy += fy;
        }
        if (link.target !== draggedNode) {
          link.target.vx -= fx;
          link.target.vy -= fy;
        }
      }

      // Center gravity & update
      for (const node of nodes) {
        if (node === draggedNode) continue;
        node.vx += (cx - node.x) * centerStrength;
        node.vy += (cy - node.y) * centerStrength;

        node.vx *= damping;
        node.vy *= damping;

        node.x += node.vx;
        node.y += node.vy;
      }

      // Draw frame
      drawCanvas();

      if (tick < 600 || draggedNode) {
        animFrameRef.current = requestAnimationFrame(runSimulation);
      }
    };

    animFrameRef.current = requestAnimationFrame(runSimulation);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activePageId, localRadius]);

  // Canvas render function
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    const nodes = simNodesRef.current;
    const links = simLinksRef.current;

    // Draw Links
    for (const link of links) {
      const isHighlighted =
        hoveredNode && (link.source.id === hoveredNode.id || link.target.id === hoveredNode.id);

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.strokeStyle = isHighlighted ? 'rgba(129, 140, 248, 0.8)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();
    }

    // Draw Nodes
    for (const node of nodes) {
      const isHovered = hoveredNode?.id === node.id;
      const isActive = activePageId === node.id;
      const matchesSearch = searchQuery && node.title.toLowerCase().includes(searchQuery.toLowerCase());

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + (isHovered ? 4 : 0), 0, Math.PI * 2);

      if (isActive) {
        ctx.fillStyle = '#38BDF8';
      } else if (node.type === 'database') {
        ctx.fillStyle = '#34D399';
      } else if (matchesSearch) {
        ctx.fillStyle = '#F43F5E';
      } else {
        ctx.fillStyle = '#818CF8';
      }

      ctx.fill();

      // Outer glow for hovered or active node
      if (isHovered || isActive) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }

      // Text label
      ctx.font = `${Math.max(10, 11 / zoom)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(226, 232, 240, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.x, node.y + node.radius + 14);
    }

    ctx.restore();
  };

  // Mouse event listeners for pan/zoom/hover
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - offset.y) / zoom;

    // Check if clicked a node
    for (const node of simNodesRef.current) {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      if (dx * dx + dy * dy <= (node.radius + 4) * (node.radius + 4)) {
        setDraggedNode(node);
        return;
      }
    }

    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - offset.y) / zoom;

    if (draggedNode) {
      draggedNode.x = mouseX;
      draggedNode.y = mouseY;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      drawCanvas();
      return;
    }

    if (isDragging) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      drawCanvas();
      return;
    }

    // Hover detection
    let found: SimNode | null = null;
    for (const node of simNodesRef.current) {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      if (dx * dx + dy * dy <= (node.radius + 4) * (node.radius + 4)) {
        found = node;
        break;
      }
    }
    if (found !== hoveredNode) {
      setHoveredNode(found);
      drawCanvas();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      onNavigateToPage(hoveredNode.id);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.5, Math.max(0.4, prev + delta)));
    setTimeout(drawCanvas, 10);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setTimeout(drawCanvas, 10);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0b0c10] overflow-hidden relative select-none">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-[#161822]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl text-xs">
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/5 rounded-lg text-slate-300">
          <Share2 size={13} className="text-indigo-400" />
          <span className="font-semibold">Knowledge Graph</span>
        </div>

        <button
          onClick={() => setLocalRadius(localRadius === 0 ? 1 : 0)}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
            localRadius > 0
              ? 'bg-indigo-600 text-white font-medium'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Local Subgraph vs Global Graph"
        >
          <Layers size={13} />
          <span>{localRadius > 0 ? 'Local 1-Hop' : 'Global Graph'}</span>
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setTimeout(drawCanvas, 10);
            }}
            className="w-36 px-2.5 py-1 pl-7 bg-black/40 border border-white/5 rounded-lg text-slate-200 focus:outline-none"
          />
          <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
        </div>
      </div>

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-1.5 bg-[#161822]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl">
        <button
          onClick={() => handleZoom(0.2)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          title="Reset View"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Hover Tooltip Overlay */}
      {hoveredNode && (
        <div className="absolute top-16 left-4 z-20 bg-[#1e2029]/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl max-w-xs animate-fade-in text-xs">
          <div className="flex items-center space-x-2 font-bold text-slate-100 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="truncate">{hoveredNode.title}</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-3 mb-2 leading-relaxed">
            {hoveredNode.excerpt || 'No preview text.'}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
            <span>{hoveredNode.degree} Connections</span>
            <span className="text-indigo-400 font-medium">Click to open</span>
          </div>
        </div>
      )}

      {/* Physics Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth - 260}
        height={window.innerHeight - 50}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

