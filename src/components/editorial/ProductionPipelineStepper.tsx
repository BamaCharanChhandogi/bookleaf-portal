'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ProductionStepperProps {
  currentStage: string;
}

const STAGES = [
  'Manuscript Received',
  'Editing',
  'Cover Design',
  'Typesetting',
  'Proofreading',
  'ISBN Assignment',
  'Sample Proof Printing',
  'Distribution Setup',
  'Published & Live',
];

export function ProductionPipelineStepper({ currentStage }: ProductionStepperProps) {
  // Normalize current stage matching
  const getActiveIndex = () => {
    const lower = currentStage.toLowerCase();
    if (lower.includes('live') || lower.includes('published')) return 8;
    if (lower.includes('distribution')) return 7;
    if (lower.includes('sample') || lower.includes('printing')) return 6;
    if (lower.includes('isbn')) return 5;
    if (lower.includes('proofreading')) return 4;
    if (lower.includes('typesetting')) return 3;
    if (lower.includes('cover')) return 2;
    if (lower.includes('editing')) return 1;
    return 0;
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="w-full rounded-2xl border border-parchment-300 bg-parchment-50/70 p-5">
      <div className="flex items-center justify-between border-b border-parchment-200 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
            Publishing Lifecycle
          </span>
          <h4 className="font-editorial text-sm font-bold text-ink-950">
            Current Stage: <span className="text-forest-800">{currentStage}</span>
          </h4>
        </div>
        <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-[10px] font-bold text-forest-800">
          Stage {activeIndex + 1} of 9
        </span>
      </div>

      {/* Stepper Timeline */}
      <div className="mt-4 flex items-center justify-between relative">
        {/* Background Connecting Bar */}
        <div className="absolute left-2 right-2 top-3 h-0.5 bg-parchment-300 -z-0" />
        <div
          className="absolute left-2 top-3 h-0.5 bg-forest-700 transition-all duration-500 -z-0"
          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  isDone
                    ? 'bg-forest-800 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white text-forest-800 ring-2 ring-forest-700 ring-offset-2 animate-pulse'
                    : 'bg-parchment-200 text-ink-500'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>

              {/* Tooltip on Hover */}
              <span className="pointer-events-none absolute -bottom-6 opacity-0 group-hover:opacity-100 transition whitespace-nowrap rounded bg-ink-950 px-1.5 py-0.5 text-[9px] text-white">
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start space-x-2 text-[11px] text-ink-600 border-t border-parchment-200 pt-3">
        <Clock className="h-3.5 w-3.5 text-gilded-600 mt-0.5 shrink-0" />
        <span>
          {currentStage.includes('Cover')
            ? 'Cover design is under review. Turnaround: 3-5 business days upon author feedback.'
            : currentStage.includes('Typesetting')
            ? 'Interior typography and margins being typeset. Standard duration: 5-7 business days.'
            : 'Book is progressing on schedule through BookLeaf production desks.'}
        </span>
      </div>
    </div>
  );
}
