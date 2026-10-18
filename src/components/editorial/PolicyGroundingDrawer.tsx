'use client';

import React from 'react';
import { BookOpen, X, CheckCircle, ExternalLink } from 'lucide-react';

interface GroundingDrawerProps {
  policyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const POLICY_DOCS: Record<string, { title: string; excerpt: string; keyPoints: string[] }> = {
  'Royalty & Payments': {
    title: 'BookLeaf Royalty & Payout Policy (Section 4.1)',
    excerpt: `BookLeaf follows an author-first 80/20 royalty split where 80% of net profit per book goes directly to the author and 20% is retained by BookLeaf. Net profit is computed as: MRP minus Printing Cost minus Marketplace Commission (Amazon/Flipkart) minus Shipping. Royalties are calculated quarterly and disbursed within 45 days after quarter close. Minimum payout threshold is ₹1,000; balances below this roll over to the subsequent quarter.`,
    keyPoints: [
      '80% author share of net profit / 20% BookLeaf share',
      'Calculated quarterly, disbursed within 45 days',
      '₹1,000 minimum threshold rollover policy',
      'Direct NEFT/IMPS bank transfer',
    ],
  },
  'Printing & Quality': {
    title: 'Print Quality & Defect Reprint Policy (Section 6.3)',
    excerpt: `BookLeaf guarantees printing craftsmanship. If an author receives physical author copies exhibiting defects such as binding separation, blurry interior graphics, or trimming misalignment, BookLeaf issues a 100% free reprint batch after photo verification. Turnaround time for reprints is 5–7 business days.`,
    keyPoints: [
      '100% free reprint on defective copies',
      'Photo verification protocol',
      '5–7 business days dispatch timeline from Delhi press',
    ],
  },
  'ISBN & Metadata Issues': {
    title: 'ISBN Imprint & Metadata Discrepancy Policy (Section 2.2)',
    excerpt: `Every published book receives an official 13-digit ISBN assigned under BookLeaf's publisher imprint. If an author reports an ISBN discrepancy or incorrect marketplace linkage, this is classified as a CRITICAL operational event requiring senior catalog escalation and resolution within 48 hours.`,
    keyPoints: [
      'Official ISBN registered under BookLeaf imprint',
      'Critical SLA: 48-hour resolution timeline',
      'Direct catalog re-index with Amazon/Flipkart feeds',
    ],
  },
  'Distribution & Availability': {
    title: 'Retail Distribution & Marketplace Stock Sync (Section 5.0)',
    excerpt: `Books are listed on Amazon India, Flipkart, BookLeaf Store, Amazon US, and Amazon UK. Listings go live within 7-10 business days post publication. "Currently Unavailable" errors indicate inventory feed de-syncs, which operations can resolve via programmatic re-sync within 24-48 hours.`,
    keyPoints: [
      'Distribution to Amazon IN/US/UK, Flipkart, BookLeaf Store',
      'Stock sync glitches resolved in 24-48 hours',
      '7-10 business days standard go-live window',
    ],
  },
};

export function PolicyGroundingDrawer({ policyTitle, isOpen, onClose }: GroundingDrawerProps) {
  if (!isOpen) return null;

  const doc = POLICY_DOCS[policyTitle] || POLICY_DOCS['Royalty & Payments'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-xs">
      <div className="h-full w-full max-w-md bg-white border-l border-parchment-300 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-forest-700" />
              <h3 className="font-editorial text-base font-bold text-ink-950">
                Grounding Knowledge Base
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-900 text-lg font-bold"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
              Official BookLeaf Operational Manual
            </span>
            <h4 className="font-editorial mt-1 text-lg font-bold text-ink-950">
              {doc.title}
            </h4>

            <div className="mt-4 rounded-xl border border-forest-600/20 bg-forest-50/40 p-4 text-xs leading-relaxed text-ink-800">
              <p className="font-serif italic">"{doc.excerpt}"</p>
            </div>

            <div className="mt-5 space-y-2">
              <h5 className="text-xs font-bold text-ink-900">Enforced Operational Rules:</h5>
              {doc.keyPoints.map((pt, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-ink-700">
                  <CheckCircle className="h-3.5 w-3.5 text-forest-700 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-parchment-200 pt-4">
          <p className="text-[11px] text-ink-500">
            This excerpt was automatically injected into the Gemini prompt context to ground the response in real company policies.
          </p>
        </div>
      </div>
    </div>
  );
}
