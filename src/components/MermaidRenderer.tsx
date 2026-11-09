import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Code, Eye, Download, AlertTriangle } from 'lucide-react';

interface MermaidRendererProps {
  code: string;
  flowchartLabeledText?: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, flowchartLabeledText }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'code' | 'raw'>('diagram');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#6366f1',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#818cf8',
        lineColor: '#38bdf8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        edgeLabelBackground: '#1e1b4b',
        clusterBkg: '#0d1527',
        clusterBorder: '#3b82f6',
        titleColor: '#e2e8f0',
        nodeBorder: '#6366f1',
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
        padding: 18,
      },
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!code) return;
      try {
        setError(null);
        // Clean mermaid code
        let cleanCode = code.trim();
        if (cleanCode.startsWith('```mermaid')) {
          cleanCode = cleanCode.replace(/^```mermaid\s*/i, '').replace(/```$/i, '').trim();
        } else if (cleanCode.startsWith('```')) {
          cleanCode = cleanCode.replace(/^```\w*\s*/i, '').replace(/```$/i, '').trim();
        }

        const id = `mermaid-svg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(id, cleanCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError(err.message || 'Failed to render Mermaid architectural flowchart.');
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopyCode = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-architecture-flowchart.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-indigo-400 font-mono">
            System Architecture Flowchart
          </span>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            Mermaid.js (graph TD)
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === 'diagram'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Interactive Diagram
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === 'code'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Mermaid Syntax
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === 'raw'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="(FLOWCHART) labeled string segment required by prompt"
          >
            <span className="font-mono font-bold text-[10px] text-amber-300">(FLOWCHART) Raw</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {viewMode === 'diagram' && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                title="Zoom Out"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-300 px-1.5">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
                title="Zoom In"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                title="Reset Zoom"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 ml-0.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent}
            title="Download SVG Diagram"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            SVG
          </button>

          <button
            onClick={() => handleCopyCode(viewMode === 'raw' ? (flowchartLabeledText || `(FLOWCHART)\n${code}`) : code)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="relative min-h-[380px] max-h-[640px] overflow-auto bg-slate-950 p-6 flex items-center justify-center">
        {error ? (
          <div className="max-w-md p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-200 text-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-red-400">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Mermaid Syntax Notice
            </div>
            <p className="text-xs text-red-300/90 leading-relaxed font-mono">{error}</p>
            <div className="mt-2 pt-2 border-t border-red-900/50">
              <span className="text-xs text-slate-400">View raw code below:</span>
              <pre className="text-xs bg-slate-900 p-2.5 rounded mt-1 overflow-x-auto text-slate-300 font-mono">
                {code}
              </pre>
            </div>
          </div>
        ) : viewMode === 'diagram' ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center items-center transition-transform duration-150"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : viewMode === 'code' ? (
          <div className="w-full h-full text-left">
            <pre className="text-xs font-mono text-emerald-400 bg-slate-900/90 p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed selection:bg-indigo-600">
              {code}
            </pre>
          </div>
        ) : (
          <div className="w-full h-full text-left">
            <div className="text-[11px] font-mono text-amber-400 mb-2 font-semibold">
              // Outputted verbatim as plain text segment labeled (FLOWCHART) per operational requirement:
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/90 p-4 rounded-xl border border-cyan-900/40 overflow-x-auto leading-relaxed">
              {flowchartLabeledText || `(FLOWCHART)\n${code}`}
            </pre>
          </div>
        )}
      </div>

      {/* Footer info note */}
      <div className="px-5 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Standardized Flow: Data Inputs &rarr; Model Layers &rarr; Hidden Representation &rarr; Output Head / Loss
        </span>
        <span className="font-mono text-slate-400">Strictly no markdown backticks inside Mermaid payload</span>
      </div>
    </div>
  );
};
