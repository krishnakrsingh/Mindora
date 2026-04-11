import React, { useMemo } from 'react';
import { diagramService } from '../../services/diagram';

interface MermaidRendererProps {
  code: string;
  isDark?: boolean;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, isDark = true }) => {
  const svgHtml = useMemo(() => {
    return diagramService.renderToSVG(code, isDark);
  }, [code, isDark]);

  return (
    <div
      className="my-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex justify-center items-center overflow-x-auto shadow-inner"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};
