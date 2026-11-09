import React, { useState } from 'react';
import { Briefcase, Zap, Layers, Sparkles, Check, Copy, Clock, Award, GitBranch } from 'lucide-react';

interface Opportunity {
  projectTitle: string;
  exactExtension: string;
  targetedPerformance: string;
  recommendedTechStack: string[];
  implementationMilestones: string[];
  resumeBulletPoint: string;
  difficultyLevel?: string;
  estimatedWeeks?: string;
}

interface OpportunitiesCardProps {
  opportunities: Opportunity[];
}

export const OpportunitiesCard: React.FC<OpportunitiesCardProps> = ({ opportunities }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Step 3
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Future Work &amp; Internship Opportunities
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              3 concrete, realistic extensions tailored for a 3rd-year CS student resume project
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-800/50 rounded-full text-xs text-emerald-300 font-mono">
          <Award className="w-3.5 h-3.5" />
          <span>Resume Ready Projects</span>
        </div>
      </div>

      {/* 3 Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="group relative bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200"
          >
            {/* Top Project Badge */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Idea #{idx + 1}
                </span>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  {opp.difficultyLevel && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {opp.difficultyLevel}
                    </span>
                  )}
                  {opp.estimatedWeeks && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {opp.estimatedWeeks}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {opp.projectTitle}
              </h3>

              {/* 1. The Exact Extension */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 mb-1">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  The Exact Extension
                </div>
                <p className="text-xs text-slate-200 bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 leading-relaxed">
                  {opp.exactExtension}
                </p>
              </div>

              {/* 2. Targeted Performance */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 mb-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Targeted Performance
                </div>
                <div className="text-xs text-emerald-200 bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 leading-relaxed font-sans">
                  {opp.targetedPerformance}
                </div>
              </div>

              {/* 3. Recommended Tech Stack */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-400 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  Recommended Tech Stack
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {opp.recommendedTechStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-900 border border-slate-700/80 text-sky-300 hover:border-sky-500/60 transition"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones if present */}
              {opp.implementationMilestones && opp.implementationMilestones.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 block mb-1.5">
                    Implementation Roadmap:
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {opp.implementationMilestones.map((ms, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-mono font-bold">{mIdx + 1}.</span>
                        <span className="leading-snug">{ms}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Resume Bullet Point Ready to Copy */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-semibold text-amber-300 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  Resume Bullet Template
                </span>
                <button
                  onClick={() => copyBullet(opp.resumeBulletPoint, idx)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition font-mono"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedIndex === idx ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-xs text-amber-100/90 font-mono leading-relaxed">
                &bull; {opp.resumeBulletPoint}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
