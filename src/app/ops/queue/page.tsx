'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Filter,
  Sparkles,
  ArrowRight,
  Flame,
  User,
  Clock,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry',
];

export default function OpsQueuePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'OLDEST_FIRST' | 'TODAY' | 'LAST_7_DAYS'

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      let list = data.tickets || [];

      // Apply Date Filter & Sorting
      const now = Date.now();
      if (dateFilter === 'TODAY') {
        list = list.filter((t: any) => now - new Date(t.createdAt).getTime() <= 24 * 60 * 60 * 1000);
      } else if (dateFilter === 'LAST_7_DAYS') {
        list = list.filter((t: any) => now - new Date(t.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === 'OLDEST_FIRST') {
        // Prioritize unresolved tickets sorted oldest to newest
        list.sort((a: any, b: any) => {
          const aUnresolved = a.status === 'OPEN' || a.status === 'IN_PROGRESS';
          const bUnresolved = b.status === 'OPEN' || b.status === 'IN_PROGRESS';
          if (aUnresolved && !bUnresolved) return -1;
          if (!aUnresolved && bUnresolved) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      }

      setTickets(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter, dateFilter]);

  // Real-time listener + polling interval
  useEffect(() => {
    const eventSource = new EventSource('/api/tickets/stream');
    eventSource.addEventListener('update', () => {
      fetchTickets();
    });

    const pollInterval = setInterval(() => {
      fetchTickets();
    }, 6000);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [statusFilter, categoryFilter, priorityFilter]);

  const getSLAIndicator = (priority: string, createdAt: string) => {
    const hoursElapsed = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const targetHours = priority === 'CRITICAL' ? 24 : priority === 'HIGH' ? 48 : 72;
    const hoursRemaining = Math.max(0, Math.round(targetHours - hoursElapsed));

    if (hoursRemaining <= 6) {
      return (
        <span className="flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          <Flame className="h-3 w-3 text-rose-600 animate-pulse" />
          <span>SLA Breach in {hoursRemaining}h</span>
        </span>
      );
    }

    return (
      <span className="text-[10px] text-ink-500">
        SLA: {hoursRemaining}h remaining
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Bar & Triage Filters */}
      <div className="flex flex-col justify-between border-b border-parchment-300 pb-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              Operations Triage Desk
            </span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
              Real-Time Feed
            </span>
          </div>
          <h1 className="font-editorial mt-1 text-2xl font-bold text-ink-950 sm:text-3xl">
            Support Inquiry Queue ({tickets.length})
          </h1>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5 md:mt-0">
          {/* Status Filter */}
          <div className="relative inline-flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-parchment-300 bg-white pl-3.5 pr-8 py-2 text-xs font-semibold text-ink-800 shadow-2xs hover:border-parchment-400 focus:border-forest-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-ink-400" />
          </div>

          {/* Priority Filter */}
          <div className="relative inline-flex items-center">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none rounded-xl border border-parchment-300 bg-white pl-3.5 pr-8 py-2 text-xs font-semibold text-ink-800 shadow-2xs hover:border-parchment-400 focus:border-forest-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Priority: All</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🔵 Medium</option>
              <option value="LOW">⚪ Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-ink-400" />
          </div>

          {/* Category Filter */}
          <div className="relative inline-flex items-center">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none rounded-xl border border-parchment-300 bg-white pl-3.5 pr-8 py-2 text-xs font-semibold text-ink-800 shadow-2xs hover:border-parchment-400 focus:border-forest-700 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Category: All' : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-ink-400" />
          </div>

          {/* Date & Urgency Filter */}
          <div className="relative inline-flex items-center">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none rounded-xl border border-parchment-300 bg-white pl-3.5 pr-8 py-2 text-xs font-semibold text-ink-800 shadow-2xs hover:border-parchment-400 focus:border-forest-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Date: All</option>
              <option value="OLDEST_FIRST">⚡ Oldest Unresolved First</option>
              <option value="TODAY">Received Today</option>
              <option value="LAST_7_DAYS">Past 7 Days</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-ink-400" />
          </div>
        </div>
      </div>

      {/* Queue Table */}
      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-forest-700 border-t-transparent" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-parchment-300 bg-white p-12 text-center text-xs text-ink-500">
          <Inbox className="mx-auto h-8 w-8 text-ink-400 mb-2" />
          No tickets found matching the selected filters.
        </div>
      ) : (
        <div className="rounded-2xl border border-parchment-300 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-parchment-300 bg-parchment-100/70 text-[11px] font-bold uppercase text-ink-700">
                <tr>
                  <th className="p-4">Author & Inquiry</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">SLA Urgency</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200">
                {tickets.map((t) => {
                  const isUnresolved = t.status === 'OPEN' || t.status === 'IN_PROGRESS';
                  const isCritical = t.priority === 'CRITICAL';
                  const hoursOld = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                  const isUrgentOrOld = isUnresolved && (isCritical || hoursOld >= 24);

                  return (
                    <tr
                      key={t.id}
                      className={`transition ${
                        isUrgentOrOld
                          ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500'
                          : 'hover:bg-parchment-50/70'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-ink-950">{t.author.name}</span>
                          {t.book && (
                            <span className="text-[10px] text-ink-500">
                              • {t.book.title}
                            </span>
                          )}
                          {isCritical && isUnresolved && (
                            <span className="rounded bg-rose-100 text-rose-800 text-[9px] font-extrabold px-1.5 py-0.2 uppercase tracking-wider">
                              CRITICAL
                            </span>
                          )}
                          {hoursOld >= 48 && isUnresolved && (
                            <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 uppercase tracking-wider">
                              OLDEST BACKLOG
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-bold text-ink-900 line-clamp-1">{t.subject}</p>
                        <p className="text-[11px] text-ink-500 line-clamp-1">{t.description}</p>
                      </td>

                    <td className="p-4">
                      <span className="rounded bg-parchment-100 px-2 py-0.5 text-[10px] font-bold text-forest-800 whitespace-nowrap">
                        {t.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                          t.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                          t.status === 'OPEN'
                            ? 'bg-amber-100 text-amber-800'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {getSLAIndicator(t.priority, t.createdAt)}
                    </td>

                    <td className="p-4 text-[11px] text-ink-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <Link
                        href={`/ops/tickets/${t.id}`}
                        className="inline-flex items-center space-x-1 rounded-xl bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-forest-800 transition"
                      >
                        <span>Open Workbench</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
