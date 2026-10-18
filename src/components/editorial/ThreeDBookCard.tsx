'use client';

import React from 'react';
import { BookOpen, ExternalLink, Calculator, Layers } from 'lucide-react';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    isbn: string;
    genre: string;
    publicationDate: string | null;
    status: string;
    mrp: number | null;
    authorRoyaltyPerCopy: number | null;
    totalCopiesSold: number;
    totalRoyaltyEarned: number;
    royaltyPaid: number;
    royaltyPending: number;
    printPartner: string | null;
    availableOn: string[];
  };
  onOpenLedger: () => void;
  onRaiseQuery: () => void;
}

export function ThreeDBookCard({ book, onOpenLedger, onRaiseQuery }: BookCardProps) {
  const isLive = book.status === 'Published & Live';

  // Distinct cover color gradient according to genre
  const getCoverGradient = () => {
    const genre = book.genre.toLowerCase();
    if (genre.includes('fiction')) return 'from-[#1b4332] via-[#2d6a4f] to-[#081c15]';
    if (genre.includes('tech') || genre.includes('code')) return 'from-[#1e293b] via-[#334155] to-[#0f172a]';
    if (genre.includes('romance')) return 'from-[#831843] via-[#9d174d] to-[#500724]';
    if (genre.includes('thriller')) return 'from-[#450a0a] via-[#7f1d1d] to-[#1c1917]';
    return 'from-[#1e3a8a] via-[#1d4ed8] to-[#172554]';
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm transition hover:border-forest-600 hover:shadow-xl">
      <div>
        {/* Top Spine Showcase Header */}
        <div className="flex items-start space-x-4">
          {/* Realistic 3D Book Spine Mockup */}
          <div className="relative shrink-0 perspective-500">
            <div
              className={`relative h-36 w-24 rounded-r-md bg-gradient-to-r ${getCoverGradient()} p-2.5 text-white shadow-book-spine transition-transform group-hover:scale-105 group-hover:-rotate-1 duration-300 flex flex-col justify-between border-l-4 border-black/40`}
            >
              {/* Embossed Spine Foil */}
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-parchment-300/80 line-clamp-1">
                  BookLeaf Press
                </span>
                <h4 className="font-editorial text-[11px] font-bold leading-tight line-clamp-3 mt-1.5 text-parchment-50">
                  {book.title}
                </h4>
              </div>

              <div>
                <p className="text-[7px] font-mono tracking-tighter text-parchment-200/70">
                  {book.isbn.slice(-7)}
                </p>
                <div className="mt-1 h-0.5 w-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Book Info Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="rounded bg-parchment-100 px-2 py-0.5 text-[10px] font-bold text-ink-700">
                {book.genre}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isLive
                    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20'
                    : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20'
                }`}
              >
                {book.status}
              </span>
            </div>

            <h3 className="font-editorial mt-2 text-base font-bold text-ink-950 group-hover:text-forest-800 transition line-clamp-2">
              {book.title}
            </h3>

            <p className="mt-1 text-[11px] font-mono text-ink-500 truncate">
              ISBN: {book.isbn}
            </p>

            <p className="mt-1 text-[11px] text-ink-600">
              Print Facility: <strong>{book.printPartner || 'In-House Delhi'}</strong>
            </p>
          </div>
        </div>

        {/* Financial / Production Matrix */}
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-parchment-200 pt-3 text-xs">
          <div className="rounded-lg bg-parchment-50 p-2">
            <span className="text-[10px] text-ink-500 uppercase">Copies Sold</span>
            <p className="font-editorial text-base font-bold text-ink-950">
              {book.totalCopiesSold.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-parchment-50 p-2">
            <span className="text-[10px] text-ink-500 uppercase">Pending Royalty</span>
            <p className="font-editorial text-base font-bold text-gilded-600">
              ₹{book.royaltyPending.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Distribution Badges */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {book.availableOn && book.availableOn.length > 0 ? (
              book.availableOn.map((ch, idx) => (
                <span
                  key={idx}
                  className="rounded border border-parchment-300 bg-white px-2 py-0.5 text-[10px] font-medium text-ink-700 shadow-2xs"
                >
                  {ch}
                </span>
              ))
            ) : (
              <span className="text-[10px] italic text-ink-400">In Production Pipeline</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-parchment-200 pt-3">
        <button
          onClick={onOpenLedger}
          className="flex items-center justify-center space-x-1 rounded-xl border border-parchment-300 py-2 text-xs font-semibold text-ink-800 transition hover:bg-parchment-100"
        >
          <Calculator className="h-3.5 w-3.5 text-forest-700" />
          <span>80/20 Ledger</span>
        </button>

        <button
          onClick={onRaiseQuery}
          className="flex items-center justify-center space-x-1 rounded-xl bg-forest-800 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-900"
        >
          <span>Raise Ticket</span>
        </button>
      </div>
    </div>
  );
}
