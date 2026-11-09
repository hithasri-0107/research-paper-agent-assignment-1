import React, { useState } from 'react';
import { Copy, Check, X, Terminal, FileCode2 } from 'lucide-react';
import { PaperAnalysis } from '../data/samplePapers';

interface RawOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PaperAnalysis;
}

export const RawOutputModal: React.FC<RawOutputModalProps> = ({ isOpen, onClose, analysis }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the exact raw text specified in the agent prompt
  const rawText = analysis.rawFormattedAgentOutput || `1. CORE CONTEXT EXTRACTION
Problem Statement: ${analysis.coreContext.problemStatement}

Prime Methodology: ${analysis.coreContext.primeMethodology}

Key Mathematical / Algorithmic Foundations: ${analysis.coreContext.keyMathematicalAlgorithmic}

Full Summary (<300 words):
${analysis.coreContext.fullSummaryUnder300Words}

2. ARCHITECTURAL FLOWCHART
(FLOWCHART)
${analysis.architecturalFlowchart.mermaidCode.trim()}

3. FUTURE WORK AND INTERNSHIP OPPORTUNITIES
${analysis.futureWorkAndInternships.map((opp, i) => `Project ${i + 1}: ${opp.projectTitle}
- The exact extension: ${opp.exactExtension}
- The targeted performance: ${opp.targetedPerformance}
- The recommended tech stack: ${opp.recommendedTechStack.join(', ')}
- Resume Impact: ${opp.resumeBulletPoint}`).join('\n\n')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Raw Agent Output
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Exact Format per Specification
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                1. Core Context &bull; 2. (FLOWCHART) Mermaid &bull; 3. Future Work &amp; Opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Raw Output!' : 'Copy Formatted Text'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed selection:bg-indigo-600">
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 whitespace-pre-wrap">
            {rawText}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            Adheres strictly to token constraint (&lt;25k tokens) and (FLOWCHART) labeling
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
