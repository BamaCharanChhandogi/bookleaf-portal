'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calculator, PlusCircle, ArrowUpRight } from 'lucide-react';
import { ThreeDBookCard } from '@/components/editorial/ThreeDBookCard';
import { ProductionPipelineStepper } from '@/components/editorial/ProductionPipelineStepper';
import { RoyaltyBreakdownModal } from '@/components/editorial/RoyaltyBreakdownModal';

export default function AuthorBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLedgerBook, setActiveLedgerBook] = useState<any | null>(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        const authRes = await fetch('/api/auth');
        const authData = await authRes.json();
        const currentUser = authData.currentUser;

        if (currentUser) {
          const booksRes = await fetch(`/api/books?authorId=${currentUser.id}`);
          const booksData = await booksRes.json();
          setBooks(booksData.books || []);
        }
      } catch (e) {
        console.error('Failed to load books', e);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-forest-700 border-t-transparent" />
      </div>
    );
  }

  const inProductionBook = books.find((b) => b.status !== 'Published & Live');

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col justify-between border-b border-parchment-300 pb-6 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Author Catalog
          </span>
          <h1 className="font-editorial mt-1 text-3xl font-extrabold text-ink-950 sm:text-4xl">
            My Published Titles ({books.length})
          </h1>
          <p className="mt-1 text-xs text-ink-600">
            Review live retail listings, sales metrics, and production pipeline stages
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-3 md:mt-0">
          <Link
            href="/portal/tickets"
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-900"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Query About a Book</span>
          </Link>
        </div>
      </div>

      {/* Production Stepper if books in progress */}
      {inProductionBook && (
        <div>
          <div className="mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Active Production Milestone: {inProductionBook.title}
            </h3>
          </div>
          <ProductionPipelineStepper currentStage={inProductionBook.status} />
        </div>
      )}

      {/* 3D Book Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <ThreeDBookCard
            key={book.id}
            book={book}
            onOpenLedger={() => setActiveLedgerBook(book)}
            onRaiseQuery={() => {
              window.location.href = `/portal/tickets?bookId=${book.id}`;
            }}
          />
        ))}
      </div>

      {/* Comprehensive Ledger Table View */}
      <div className="rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm">
        <h3 className="font-editorial text-lg font-bold text-ink-950">Detailed Catalog Ledger</h3>
        <p className="text-xs text-ink-500 mb-4">Complete figures seeded from BookLeaf database</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-parchment-300 bg-parchment-100/70 text-[11px] font-bold uppercase text-ink-700">
              <tr>
                <th className="p-3">Title & ISBN</th>
                <th className="p-3">Genre</th>
                <th className="p-3">Status</th>
                <th className="p-3">MRP</th>
                <th className="p-3">Royalty/Copy</th>
                <th className="p-3">Copies Sold</th>
                <th className="p-3">Earned</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-200">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-parchment-50/50">
                  <td className="p-3">
                    <p className="font-bold text-ink-950">{b.title}</p>
                    <p className="font-mono text-[10px] text-ink-500">{b.isbn}</p>
                  </td>
                  <td className="p-3 text-ink-700">{b.genre}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        b.status === 'Published & Live'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{b.mrp ? `₹${b.mrp}` : '—'}</td>
                  <td className="p-3 font-semibold text-forest-700">
                    {b.authorRoyaltyPerCopy ? `₹${b.authorRoyaltyPerCopy}` : '—'}
                  </td>
                  <td className="p-3 font-bold">{b.totalCopiesSold.toLocaleString()}</td>
                  <td className="p-3 font-bold text-ink-950">₹{b.totalRoyaltyEarned.toLocaleString()}</td>
                  <td className="p-3 font-semibold text-emerald-700">₹{b.royaltyPaid.toLocaleString()}</td>
                  <td className="p-3 font-bold text-gilded-600">₹{b.royaltyPending.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Royalty Modal */}
      {activeLedgerBook && (
        <RoyaltyBreakdownModal
          book={activeLedgerBook}
          onClose={() => setActiveLedgerBook(null)}
        />
      )}
    </div>
  );
}
