import React, { useEffect, useRef, useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Share2,
  Search,
  Pause,
  Play,
  ExternalLink,
  X,
  Layers,
  Sliders
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPhysicsRunning, setIsPhysicsRunning] = useState(true);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggedNode, setDraggedNode] = useState<SimNode | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Build graph on mount
  useEffect(() => {
    const data: GraphData = graphService.buildWorkspaceGraph(activePageId, 0);
    const width = window.innerWidth - 300;
    const height = window.innerHeight - 100;

    const nodeMap = new Map<string, SimNode>();
    const simNodes: SimNode[] = data.nodes.map((n, i) => {
      const angle = (i / Math.max(1, data.nodes.length)) * Math.PI * 2;
      const dist = 160 + Math.random() * 100;
      const radius = Math.max(7, Math.min(22, 6 + n.degree * 3));

      const simNode: SimNode = {
        ...n,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
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

    // Simulation loop
    const runSimulation = () => {
      if (isPhysicsRunning) {
        const nodes = simNodesRef.current;
        const links = simLinksRef.current;
        const cx = width / 2;
        const cy = height / 2;

        const repulsion = 450;
        const springLength = 110;
        const springK = 0.035;
        const centerGravity = 0.015;

        // Node repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 400) {
              const force = repulsion / (dist * dist);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              nodes[i].vx -= fx;
              nodes[i].vy -= fy;
              nodes[j].vx += fx;
              nodes[j].vy += fy;
            }
          }
        }

        // Spring links
        for (const link of links) {
          const dx = link.target.x - link.source.x;
          const dy = link.target.y - link.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const delta = dist - springLength;
          const force = delta * springK;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          link.source.vx += fx;
          link.source.vy += fy;
          link.target.vx -= fx;
          link.target.vy -= fy;
        }

        // Center gravity and velocity damping
        for (const node of nodes) {
          if (node === draggedNode) continue;
          node.vx += (cx - node.x) * centerGravity;
          node.vy += (cy - node.y) * centerGravity;
          node.vx *= 0.88;
          node.vy *= 0.88;
          node.x += node.vx;
          node.y += node.vy;
        }
      }

      draw();
      animFrameRef.current = requestAnimationFrame(runSimulation);
    };

    animFrameRef.current = requestAnimationFrame(runSimulation);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activePageId, isPhysicsRunning]);

  // Canvas drawing routine
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    const nodes = simNodesRef.current;
    const links = simLinksRef.current;

    // Draw Links
    for (const link of links) {
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw Nodes
    for (const node of nodes) {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const matchesSearch = searchQuery && node.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag && node.tags?.includes(selectedTag);

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      if (matchesSearch || isSelected) {
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      } else if (matchesTag) {
        ctx.fillStyle = '#38bdf8';
      } else if (isHovered) {
        ctx.fillStyle = isDark ? '#d4d4d4' : '#525252';
      } else {
        ctx.fillStyle = isDark ? '#3f3f3f' : '#e5e5e5';
      }

      ctx.fill();

      // Outer ring for active or selected
      if (isSelected || node.id === activePageId) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Label
      ctx.font = `${isSelected || isHovered ? '600' : '500'} 11px Inter, sans-serif`;
      ctx.fillStyle = isDark ? (isSelected ? '#ffffff' : '#a3a3a3') : (isSelected ? '#000000' : '#525252');
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.x, node.y + node.radius + 14);
    }

    ctx.restore();
  };

  // Resize canvas to window
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;
        draw();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse drag & interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - offset.y) / zoom;

    const clicked = simNodesRef.current.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    if (clicked) {
      setDraggedNode(clicked);
      setSelectedNode(clicked);
    } else {
      setIsDraggingCanvas(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
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
      return;
    }

    if (isDraggingCanvas) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    // Hover detection
    const hovered = simNodesRef.current.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });
    setHoveredNode(hovered || null);
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsDraggingCanvas(false);
  };

  // Collect all unique tags for filter
  const allGraphTags = Array.from(
    new Set(simNodesRef.current.flatMap((n) => n.tags || []))
  );

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-[#171717] select-none transition-colors">
      {/* Top Floating Control Toolbar (Pill style) */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Search Pill */}
          <div className="search-pill w-56">
            <Search size={13} className="text-[#737373]" />
            <input
              type="text"
              placeholder="Search graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-xs w-full text-black dark:text-white"
            />
          </div>

          {/* Tag Filter Chips */}
          <div className="hidden md:flex items-center space-x-1">
            {allGraphTags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`btn-pill btn-pill-sm ${selectedTag === tag ? 'btn-pill-active' : ''}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom & Physics Toolbar */}
        <div className="flex items-center space-x-1.5 pointer-events-auto">
          <button
            onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
            className="btn-pill btn-pill-sm"
            title={isPhysicsRunning ? 'Pause Force Simulation' : 'Resume Force Simulation'}
          >
            {isPhysicsRunning ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z * 1.2))}
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
              setOffset({ x: 0, y: 0 });
            }}
            className="btn-pill btn-pill-sm"
            title="Reset Graph Center"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <div className="absolute right-6 top-16 bottom-6 w-80 bg-white dark:bg-[#1e1e1e] border border-[#e5e5e5] dark:border-[#333] rounded-2xl shadow-xl p-5 flex flex-col justify-between z-30 animate-fade-in text-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5] dark:border-[#2e2e2e] mb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">
                Node Inspector
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-full text-[#737373] hover:text-black dark:hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="font-heading font-bold text-base text-black dark:text-white mb-2">
              {selectedNode.title}
            </div>

            <div className="space-y-2 text-[#737373] dark:text-[#a3a3a3]">
              <div className="flex justify-between">
                <span>Degree (Connections):</span>
                <span className="font-mono font-semibold text-black dark:text-white">{selectedNode.degree}</span>
              </div>
              <div className="flex justify-between">
                <span>Node Type:</span>
                <span className="font-mono uppercase">{selectedNode.type}</span>
              </div>
            </div>

            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#e5e5e5] dark:border-[#2e2e2e]">
                <div className="text-[11px] font-medium text-[#737373] mb-1.5">Tags:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-[#fafafa] dark:bg-[#282828] border border-[#e5e5e5] dark:border-[#333] text-[#525252] dark:text-[#d4d4d4]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToPage(selectedNode.title)}
            className="btn-pill-primary w-full justify-center"
          >
            <ExternalLink size={12} />
            <span>Open Document</span>
          </button>
        </div>
      )}
    </div>
  );
};
