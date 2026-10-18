'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  BookOpen,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';

export default function AuthorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authRes = await fetch('/api/auth');
        const authData = await authRes.json();
        const currentUser = authData.currentUser;
        setUser(currentUser);

        if (currentUser) {
          const [booksRes, ticketsRes] = await Promise.all([
            fetch(`/api/books?authorId=${currentUser.id}`),
            fetch(`/api/tickets?authorId=${currentUser.id}`),
          ]);

          const booksData = await booksRes.json();
          const ticketsData = await ticketsRes.json();

          setBooks(booksData.books || []);
          setTickets(ticketsData.tickets || []);
        }
      } catch (e) {
        console.error('Failed to load dashboard', e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-forest-700 border-t-transparent" />
      </div>
    );
  }

  const totalEarned = books.reduce((acc, b) => acc + (b.totalRoyaltyEarned || 0), 0);
  const totalPaid = books.reduce((acc, b) => acc + (b.royaltyPaid || 0), 0);
  const totalPending = books.reduce((acc, b) => acc + (b.royaltyPending || 0), 0);
  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopiesSold || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Hero */}
      <div className="flex flex-col justify-between border-b border-parchment-300 pb-6 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Publishing Overview
          </span>
          <h1 className="font-editorial mt-1 text-3xl font-extrabold text-ink-950 sm:text-4xl">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-xs text-ink-600">
            {user?.city ? `${user.city}, India` : 'Verified Author'} · Managing {books.length} title(s) across Amazon, Flipkart & BookLeaf Store
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-3 md:mt-0">
          <Link
            href="/portal/tickets"
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-900"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Raise Support Ticket</span>
          </Link>
        </div>
      </div>

      {/* Financial Ledger Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earned */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Royalty Earned</span>
            <TrendingUp className="h-4 w-4 text-forest-700" />
          </div>
          <p className="font-editorial mt-2 text-2xl font-bold text-ink-950">
            ₹{totalEarned.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-ink-500">80% author net profit share</p>
        </div>

        {/* Royalty Disbursed */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Disbursed to Bank</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="font-editorial mt-2 text-2xl font-bold text-ink-950">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-ink-500">Quarterly bank transfers</p>
        </div>

        {/* Royalty Pending */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Royalty</span>
            <Clock className="h-4 w-4 text-gilded-600" />
          </div>
          <p className="font-editorial mt-2 text-2xl font-bold text-ink-950">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>

          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-ink-500 mb-1">
              <span>Payout Threshold</span>
              <span>₹{totalPending} / ₹1,000</span>
            </div>
            <div className="h-1.5 w-full bg-parchment-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${totalPending >= 1000 ? 'bg-emerald-600' : 'bg-gilded-500'}`}
                style={{ width: `${Math.min(100, (totalPending / 1000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Copies Sold */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Copies Sold</span>
            <BookOpen className="h-4 w-4 text-ink-700" />
          </div>
          <p className="font-editorial mt-2 text-2xl font-bold text-ink-950">
            {totalCopies.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-500">Across retail channels</p>
        </div>
      </div>

      {/* Threshold Rollover Policy Notice (If under 1000) */}
      {totalPending > 0 && totalPending < 1000 && (
        <div className="flex items-start space-x-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <p className="font-bold">Quarterly Rollover Policy in Effect</p>
            <p className="mt-0.5 leading-relaxed text-amber-800">
              Your pending royalty balance stands at ₹{totalPending}. As per BookLeaf Publishing's policy, balances under ₹1,000 roll over automatically to the subsequent quarterly cycle and combine with future sales.
            </p>
          </div>
        </div>
      )}

      {/* Split Section: Published Catalog Preview & Recent Support Tickets */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Books Snapshot */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-ink-950">My Published Titles</h3>
              <p className="text-xs text-ink-500">Live titles and production pipeline</p>
            </div>
            <Link
              href="/portal/books"
              className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center space-x-1"
            >
              <span>View All ({books.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-parchment-200">
            {books.slice(0, 3).map((book) => (
              <div key={book.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ink-900">{book.title}</h4>
                  <p className="text-[11px] font-mono text-ink-500">ISBN: {book.isbn}</p>
                  <span className="mt-1 inline-block rounded bg-parchment-100 px-2 py-0.5 text-[9px] font-semibold text-ink-700">
                    {book.genre}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      book.status === 'Published & Live'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {book.status}
                  </span>
                  <p className="mt-1 text-xs font-bold text-forest-800">
                    {book.totalCopiesSold} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Inquiries Snapshot */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-ink-950">Support Communications</h3>
              <p className="text-xs text-ink-500">Active queries and operations responses</p>
            </div>
            <Link
              href="/portal/tickets"
              className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center space-x-1"
            >
              <span>View Tickets ({tickets.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-500">
                <MessageSquare className="mx-auto h-6 w-6 text-ink-400 mb-2" />
                No active support queries filed yet.
              </div>
            ) : (
              <div className="divide-y divide-parchment-200">
                {tickets.slice(0, 3).map((t) => (
                  <Link
                    key={t.id}
                    href={`/portal/tickets/${t.id}`}
                    className="group block py-3.5 first:pt-0 last:pb-0 hover:bg-parchment-50 transition px-2 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-ink-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          t.status === 'OPEN'
                            ? 'bg-amber-100 text-amber-800'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-ink-900 group-hover:text-forest-800 transition line-clamp-1">
                      {t.subject}
                    </p>
                    <p className="text-[11px] text-forest-700 mt-0.5 font-medium">{t.category}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
