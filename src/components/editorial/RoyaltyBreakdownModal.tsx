'use client';

import React from 'react';
import { IndianRupee, PieChart, Info, CheckCircle2 } from 'lucide-react';

interface RoyaltyModalProps {
  book: {
    title: string;
    isbn: string;
    mrp: number | null;
    authorRoyaltyPerCopy: number | null;
    totalCopiesSold: number;
    totalRoyaltyEarned: number;
    royaltyPaid: number;
    royaltyPending: number;
    availableOn: string[];
  };
  onClose: () => void;
}

export function RoyaltyBreakdownModal({ book, onClose }: RoyaltyModalProps) {
  const mrp = book.mrp || 399;
  // Estimated production breakdowns matching BookLeaf 80/20 formula
  const printCost = Math.round(mrp * 0.3);
  const platformFee = Math.round(mrp * 0.22);
  const shippingFee = 35;
  const netProfit = Math.max(0, mrp - printCost - platformFee - shippingFee);
  const authorShare = Math.round(netProfit * 0.8);
  const bookLeafShare = netProfit - authorShare;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-parchment-300 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-parchment-200 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
              Financial Transparency Ledger
            </span>
            <h3 className="font-editorial text-xl font-bold text-ink-950">
              {book.title}
            </h3>
            <p className="text-xs font-mono text-ink-500">ISBN: {book.isbn}</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* 80/20 Net Profit Breakdown Visual */}
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-parchment-200 bg-parchment-50 p-4">
            <h4 className="text-xs font-bold text-ink-900 mb-3 flex items-center space-x-1.5">
              <PieChart className="h-4 w-4 text-forest-700" />
              <span>Net Profit Deduction Breakdown (Per Copy)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-ink-800">
                <span>Retail Price (MRP)</span>
                <span className="font-bold">₹{mrp}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>- Printing Cost (In-House Delhi)</span>
                <span>-₹{printCost}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>- Marketplace Commission (Amazon / Flipkart)</span>
                <span>-₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>- Packaging & Logistics</span>
                <span>-₹{shippingFee}</span>
              </div>
              <div className="border-t border-parchment-300 pt-2 flex justify-between font-bold text-ink-950">
                <span>Net Profit Pool</span>
                <span className="text-forest-800">₹{netProfit}</span>
              </div>
            </div>
          </div>

          {/* 80/20 Split Highlight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-forest-600/30 bg-forest-50 p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                Author Share (80%)
              </span>
              <p className="font-editorial text-2xl font-bold text-forest-900 mt-1">
                ₹{book.authorRoyaltyPerCopy || authorShare}
              </p>
              <p className="text-[10px] text-forest-700 mt-0.5">credited per sale</p>
            </div>

            <div className="rounded-xl border border-parchment-200 bg-parchment-50 p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                BookLeaf Share (20%)
              </span>
              <p className="font-editorial text-2xl font-bold text-ink-800 mt-1">
                ₹{bookLeafShare}
              </p>
              <p className="text-[10px] text-ink-500 mt-0.5">operations & platform</p>
            </div>
          </div>

          {/* Aggregate Lifetime Figures */}
          <div className="rounded-xl border border-parchment-200 p-4 bg-white text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-600">Total Copies Sold Across All Channels:</span>
              <span className="font-bold text-ink-900">{book.totalCopiesSold} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Total Royalty Accrued:</span>
              <span className="font-bold text-forest-800">₹{book.totalRoyaltyEarned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Disbursed to Bank:</span>
              <span className="font-bold text-emerald-700">₹{book.royaltyPaid}</span>
            </div>
            <div className="flex justify-between border-t border-parchment-200 pt-2 font-bold">
              <span className="text-ink-900">Pending Next Quarter Payout:</span>
              <span className="text-gilded-600">₹{book.royaltyPending}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-parchment-200 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-ink-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ink-950"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
