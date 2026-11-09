import React, { useState } from 'react';
import { Target, Cpu, Sigma, BookOpen, Copy, Check, FileCheck } from 'lucide-react';

interface CoreContextCardProps {
  context: {
    problemStatement: string;
    primeMethodology: string;
    keyMathematicalAlgorithmic: string;
    keyConcepts?: string[];
    fullSummaryUnder300Words: string;
    wordCount?: number;
  };
}

export const CoreContextCard: React.FC<CoreContextCardProps> = ({ context }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const calculateWords = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const actualWordCount = context.wordCount || calculateWords(context.fullSummaryUnder300Words);
  const isUnderLimit = actualWordCount <= 300;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Step 1
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Core Context Extraction
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Plain, accessible language summary under 300 words
            </p>
          </div>
        </div>

        {/* Word Count Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
              isUnderLimit
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{actualWordCount} words</span>
            <span className="text-slate-400">/ 300 words constraint</span>
            {isUnderLimit && <span className="text-emerald-400 font-bold">&#10003;</span>}
          </div>

          <button
            onClick={() => copyToClipboard(context.fullSummaryUnder300Words, 'summary')}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            {copied === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === 'summary' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Unified Summary Highlight Box */}
      <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-4.5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
        <span className="text-[11px] font-mono uppercase font-bold text-indigo-300 tracking-wider block mb-2">
          Plain Language Synthesis (&lt;300 Words)
        </span>
        <p className="text-slate-200 text-sm leading-relaxed font-sans">
          {context.fullSummaryUnder300Words}
        </p>

        {context.keyConcepts && context.keyConcepts.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-indigo-900/50 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold mr-1">
              Key Concepts:
            </span>
            {context.keyConcepts.map((concept, cIdx) => (
              <span
                key={cIdx}
                className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-indigo-700/50 text-[11px] font-mono text-cyan-200"
              >
                {concept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3 Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Problem Statement */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-300">
                Problem Statement
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {context.problemStatement}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(context.problemStatement, 'problem')}
            className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end text-[11px] text-slate-400 hover:text-slate-200 transition"
          >
            {copied === 'problem' ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied === 'problem' ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* 2. Prime Methodology */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-300">
                Prime Methodology
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {context.primeMethodology}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(context.primeMethodology, 'method')}
            className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end text-[11px] text-slate-400 hover:text-slate-200 transition"
          >
            {copied === 'method' ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied === 'method' ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* 3. Mathematical / Algorithmic */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sigma className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-300">
                Mathematical Foundations
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
              {context.keyMathematicalAlgorithmic}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(context.keyMathematicalAlgorithmic, 'math')}
            className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end text-[11px] text-slate-400 hover:text-slate-200 transition"
          >
            {copied === 'math' ? <Check className="w-3 h-3 text-emerald-400 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied === 'math' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
