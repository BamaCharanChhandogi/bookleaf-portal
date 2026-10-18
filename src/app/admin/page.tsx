'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Filter,
  Sparkles,
  Send,
  User,
  Clock,
  BookOpen,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  FileText,
  RefreshCw,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Sliders,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { PolicyGroundingDrawer } from '@/components/editorial/PolicyGroundingDrawer';

interface Author {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  books?: any[];
}

interface Book {
  id: string;
  title: string;
  isbn: string;
  genre: string;
  status: string;
  mrp: number | null;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
  availableOn: string;
}

interface TicketMessage {
  id: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface InternalNote {
  id: string;
  adminName: string;
  note: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string | null;
  aiSuggestedCategory: string | null;
  aiSuggestedPriority: string | null;
  aiPriorityReason: string | null;
  aiDraftResponse: string | null;
  aiGroundingPolicy: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  author: Author;
  book: Book | null;
  messages: TicketMessage[];
  internalNotes: InternalNote[];
}

const CATEGORIES = [
  'ALL',
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry',
];

export default function AdminPortalPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // AI Co-Pilot & Tone Calibration
  const [editableDraft, setEditableDraft] = useState('');
  const [regeneratingDraft, setRegeneratingDraft] = useState(false);
  const [sendingDraft, setSendingDraft] = useState(false);
  const [activeTone, setActiveTone] = useState<'EMPATHETIC' | 'CONCISE' | 'URGENT'>('EMPATHETIC');

  // Policy Grounding Slide-over
  const [showGroundingDrawer, setShowGroundingDrawer] = useState(false);

  // Internal Notes State
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Status & Priority Overrides
  const [currentPriority, setCurrentPriority] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      const loaded = data.tickets || [];
      setTickets(loaded);

      if (loaded.length > 0) {
        if (!selectedTicket || !loaded.some((t: Ticket) => t.id === selectedTicket.id)) {
          selectTicket(loaded[0]);
        } else {
          const fresh = loaded.find((t: Ticket) => t.id === selectedTicket.id);
          if (fresh) selectTicket(fresh);
        }
      } else {
        setSelectedTicket(null);
      }
    } catch (e) {
      console.error('Failed to load tickets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter]);

  // Real-Time SSE Listener
  useEffect(() => {
    const eventSource = new EventSource('/api/tickets/stream');
    eventSource.addEventListener('update', () => {
      fetchTickets();
    });

    return () => {
      eventSource.close();
    };
  }, [selectedTicket?.id]);

  const selectTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setEditableDraft(t.aiDraftResponse || '');
    setCurrentPriority(t.priority);
    setCurrentCategory(t.category);
    setCurrentStatus(t.status);
  };

  const handleToneChange = (tone: 'EMPATHETIC' | 'CONCISE' | 'URGENT') => {
    setActiveTone(tone);
    if (!editableDraft || !selectedTicket) return;

    const firstName = selectedTicket.author.name.split(' ')[0];

    if (tone === 'CONCISE') {
      setEditableDraft(
        `Dear ${firstName},\n\nWe have reviewed your inquiry regarding "${selectedTicket.subject}". Under BookLeaf operating procedures, our catalog desk has been assigned to complete resolution. We will follow up with confirmation within 48 hours.\n\nBest regards,\nBookLeaf Operations Desk`
      );
    } else if (tone === 'URGENT') {
      setEditableDraft(
        `Dear ${firstName},\n\nWe sincerely apologize for this inconvenience. We treat this as a high-priority matter and have directly escalated this ticket to our senior production and finance supervisors for immediate resolution within 24 hours.\n\nWarm regards,\nBookLeaf Operations Lead`
      );
    } else {
      setEditableDraft(selectedTicket.aiDraftResponse || '');
    }
  };

  const insertSnippet = (snippet: string) => {
    setEditableDraft((prev) => `${prev}\n\n${snippet}`);
  };

  const handleSendDraft = async () => {
    if (!selectedTicket || !editableDraft.trim()) return;
    try {
      setSendingDraft(true);
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: 'ADMIN',
          senderName: 'Aditi Rao (BookLeaf Ops Lead)',
          message: editableDraft.trim(),
        }),
      });

      if (res.ok) {
        await fetchTickets();
      }
    } catch (e) {
      console.error('Failed to send draft', e);
    } finally {
      setSendingDraft(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newNote.trim()) return;
    try {
      setAddingNote(true);
      const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: 'Aditi Rao',
          note: newNote.trim(),
        }),
      });
      if (res.ok) {
        setNewNote('');
        await fetchTickets();
      }
    } catch (e) {
      console.error('Failed to add note', e);
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateMeta = async (updates: Partial<{ status: string; priority: string; category: string; assignedTo: string }>) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchTickets();
      }
    } catch (e) {
      console.error('Update meta failed', e);
    }
  };

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
    <div className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6">
      {/* Top Operations Header */}
      <div className="flex flex-col justify-between border-b border-parchment-300 pb-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-800 text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              BookLeaf Operations Desk
            </span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
              Active Lead: Aditi Rao (Senior Ops Lead)
            </span>
          </div>
          <h1 className="font-editorial mt-1 text-2xl font-bold text-ink-950 sm:text-3xl">
            Triage Workbench & AI Co-Pilot
          </h1>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-parchment-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 shadow-sm"
          >
            <option value="ALL">Status: All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-parchment-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 shadow-sm"
          >
            <option value="ALL">Priority: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-parchment-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 shadow-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Category: All' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Column Split Workbench */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* COLUMN 1: Triage Queue (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-ink-600 px-1">
            <span className="font-bold uppercase tracking-wider text-ink-900">
              Active Queue ({tickets.length})
            </span>
            <span>Sorted by Urgency</span>
          </div>

          <div className="max-h-[820px] space-y-2.5 overflow-y-auto pr-1">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => selectTicket(t)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  selectedTicket?.id === t.id
                    ? 'border-forest-700 bg-forest-50/50 shadow-sm ring-1 ring-forest-700/20'
                    : 'border-parchment-300 bg-white hover:border-parchment-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        t.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="rounded bg-parchment-100 px-1.5 py-0.5 text-[10px] font-bold text-ink-700">
                      {t.status}
                    </span>
                  </div>

                  {getSLAIndicator(t.priority, t.createdAt)}
                </div>

                <h3 className="mt-2 text-sm font-bold text-ink-950 line-clamp-1">
                  {t.subject}
                </h3>

                <p className="mt-1 text-xs text-ink-600 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-parchment-200 pt-2 text-[11px] text-ink-500">
                  <span className="font-semibold text-ink-800">
                    ✍️ {t.author.name}
                  </span>
                  <span className="text-forest-700 font-medium truncate max-w-[150px]">
                    {t.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: Conversation & AI Co-Pilot 2.0 (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-between rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm min-h-[820px]">
          {selectedTicket ? (
            <div>
              {/* Ticket Controls */}
              <div className="border-b border-parchment-200 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-editorial text-xl font-bold text-ink-950">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-xs text-ink-600 mt-0.5">
                      Ticket #{selectedTicket.id.slice(-6)} · Raised by {selectedTicket.author.name}
                    </p>
                  </div>

                  <select
                    value={currentStatus}
                    onChange={(e) => {
                      setCurrentStatus(e.target.value);
                      handleUpdateMeta({ status: e.target.value });
                    }}
                    className="rounded-xl border border-parchment-300 bg-white px-3 py-1 text-xs font-bold text-ink-800 shadow-2xs"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* AI Classification & Manual Overrides Bar */}
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-parchment-100/70 p-2.5 text-xs">
                  <span className="inline-flex items-center space-x-1 font-semibold text-forest-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Triage:</span>
                  </span>

                  <select
                    value={currentCategory}
                    onChange={(e) => {
                      setCurrentCategory(e.target.value);
                      handleUpdateMeta({ category: e.target.value });
                    }}
                    className="rounded-lg border border-parchment-300 bg-white px-2 py-0.5 text-xs text-ink-800"
                  >
                    {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentPriority}
                    onChange={(e) => {
                      setCurrentPriority(e.target.value);
                      handleUpdateMeta({ priority: e.target.value });
                    }}
                    className="rounded-lg border border-parchment-300 bg-white px-2 py-0.5 text-xs font-bold text-ink-800"
                  >
                    <option value="CRITICAL">🔴 Critical</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="MEDIUM">🔵 Medium</option>
                    <option value="LOW">⚪ Low</option>
                  </select>

                  <button
                    onClick={() => handleUpdateMeta({ assignedTo: 'Aditi Rao' })}
                    className="ml-auto text-[11px] font-semibold text-forest-700 hover:text-forest-900"
                  >
                    {selectedTicket.assignedTo ? `Lead: ${selectedTicket.assignedTo}` : '👉 Claim Ticket'}
                  </button>
                </div>
              </div>

              {/* Message Thread */}
              <div className="my-4 max-h-[250px] space-y-3 overflow-y-auto pr-2">
                {selectedTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.senderRole === 'ADMIN' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-[10px] text-ink-500 mb-1">
                      <span className="font-semibold text-ink-800">{m.senderName}</span>
                      <span>•</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        m.senderRole === 'ADMIN'
                          ? 'bg-forest-800 text-white rounded-tr-none'
                          : 'border border-parchment-300 bg-parchment-50 text-ink-900 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Co-Pilot 2.0 Composer */}
              <div className="mt-3 rounded-2xl border border-forest-600/30 bg-forest-50/20 p-4">
                <div className="flex items-center justify-between border-b border-forest-600/20 pb-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-forest-900">
                    <Sparkles className="h-4 w-4 text-forest-700" />
                    <span>AI Co-Pilot Grounded Draft</span>
                  </div>

                  <button
                    onClick={() => setShowGroundingDrawer(true)}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-forest-700 hover:underline"
                  >
                    <span>View Policy Grounding</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Tone Calibrator Bar */}
                <div className="mt-2.5 flex items-center space-x-1.5">
                  <span className="text-[10px] font-semibold text-ink-500 uppercase mr-1">
                    Tone:
                  </span>
                  <button
                    onClick={() => handleToneChange('EMPATHETIC')}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                      activeTone === 'EMPATHETIC'
                        ? 'bg-forest-800 text-white shadow-2xs'
                        : 'border border-parchment-300 bg-white text-ink-700 hover:bg-parchment-50'
                    }`}
                  >
                    Empathetic
                  </button>
                  <button
                    onClick={() => handleToneChange('CONCISE')}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                      activeTone === 'CONCISE'
                        ? 'bg-forest-800 text-white shadow-2xs'
                        : 'border border-parchment-300 bg-white text-ink-700 hover:bg-parchment-50'
                    }`}
                  >
                    Concise / Formal
                  </button>
                  <button
                    onClick={() => handleToneChange('URGENT')}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                      activeTone === 'URGENT'
                        ? 'bg-forest-800 text-white shadow-2xs'
                        : 'border border-parchment-300 bg-white text-ink-700 hover:bg-parchment-50'
                    }`}
                  >
                    Urgent Apology
                  </button>
                </div>

                {/* Canned Quick Insert Chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      insertSnippet(
                        'As per BookLeaf Policy, royalties follow an 80/20 net profit split (calculated quarterly and paid within 45 days).'
                      )
                    }
                    className="rounded border border-parchment-300 bg-white px-2 py-0.5 text-[10px] text-ink-700 hover:bg-parchment-100"
                  >
                    + 80/20 Net Profit Rule
                  </button>
                  <button
                    onClick={() =>
                      insertSnippet(
                        'We will arrange a 100% free reprint batch from our Delhi print facility within 5–7 business days.'
                      )
                    }
                    className="rounded border border-parchment-300 bg-white px-2 py-0.5 text-[10px] text-ink-700 hover:bg-parchment-100"
                  >
                    + Free Reprint Guarantee
                  </button>
                  <button
                    onClick={() =>
                      insertSnippet(
                        'Amounts below the ₹1,000 threshold roll over safely to combine with next quarter’s sales.'
                      )
                    }
                    className="rounded border border-parchment-300 bg-white px-2 py-0.5 text-[10px] text-ink-700 hover:bg-parchment-100"
                  >
                    + ₹1,000 Rollover Rule
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  rows={5}
                  value={editableDraft}
                  onChange={(e) => setEditableDraft(e.target.value)}
                  className="mt-2.5 w-full rounded-xl border border-parchment-300 bg-white p-3 text-xs leading-relaxed text-ink-900 shadow-inner focus:border-forest-700 focus:outline-none"
                  placeholder="Review AI response draft..."
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-ink-500">
                    Review and calibrate draft before dispatching to author
                  </span>

                  <button
                    onClick={handleSendDraft}
                    disabled={sendingDraft || !editableDraft.trim()}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-900 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{sendingDraft ? 'Sending...' : 'Approve & Send to Author'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-500">
              Select a ticket from the queue
            </div>
          )}
        </div>

        {/* COLUMN 3: Author Dossier & Internal Notes (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {selectedTicket ? (
            <>
              {/* Author Dossier */}
              <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
                <div className="flex items-center space-x-2 border-b border-parchment-200 pb-3">
                  <User className="h-4 w-4 text-forest-700" />
                  <h3 className="font-editorial text-sm font-bold text-ink-950">
                    Author Dossier
                  </h3>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-ink-500">Author Name</span>
                    <p className="font-semibold text-ink-900">{selectedTicket.author.name}</p>
                  </div>
                  <div>
                    <span className="text-ink-500">Email & Location</span>
                    <p className="text-ink-800">{selectedTicket.author.email}</p>
                    <p className="text-ink-600">{selectedTicket.author.city || 'India'}</p>
                  </div>
                </div>

                {selectedTicket.book && (
                  <div className="mt-4 border-t border-parchment-200 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                      Linked Title Metadata
                    </span>
                    <h4 className="font-editorial mt-1 text-sm font-bold text-ink-900">
                      {selectedTicket.book.title}
                    </h4>
                    <p className="text-[10px] font-mono text-ink-500">
                      ISBN: {selectedTicket.book.isbn}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg bg-parchment-50 p-2">
                        <span className="text-ink-500">Copies Sold</span>
                        <p className="font-bold text-ink-900">{selectedTicket.book.totalCopiesSold}</p>
                      </div>
                      <div className="rounded-lg bg-parchment-50 p-2">
                        <span className="text-ink-500">Pending</span>
                        <p className="font-bold text-gilded-600">₹{selectedTicket.book.royaltyPending}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Private Notes */}
              <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
                <div className="flex items-center space-x-2 border-b border-parchment-200 pb-3">
                  <Bookmark className="h-4 w-4 text-gilded-600" />
                  <h3 className="font-editorial text-sm font-bold text-ink-950">
                    Internal Ops Notes
                  </h3>
                </div>

                <div className="my-3 max-h-44 space-y-2 overflow-y-auto">
                  {selectedTicket.internalNotes.length === 0 ? (
                    <p className="text-xs text-ink-400 italic">No internal notes yet</p>
                  ) : (
                    selectedTicket.internalNotes.map((note) => (
                      <div key={note.id} className="rounded-xl bg-amber-50/80 p-2.5 text-xs border border-amber-200/50">
                        <div className="flex items-center justify-between text-[10px] text-amber-800">
                          <span className="font-bold">{note.adminName}</span>
                          <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="mt-1 text-amber-950">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="mt-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add private note for ops..."
                    className="w-full rounded-xl border border-parchment-300 px-3 py-1.5 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNote.trim()}
                    className="mt-2 w-full rounded-xl bg-ink-900 py-1.5 text-xs font-semibold text-white hover:bg-ink-950 disabled:opacity-50"
                  >
                    Add Private Note
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-parchment-300 bg-white p-6 text-center text-xs text-ink-500">
              Select a ticket
            </div>
          )}
        </div>
      </div>

      {/* Grounding Drawer Slide-Over */}
      <PolicyGroundingDrawer
        policyTitle={selectedTicket?.category || 'Royalty & Payments'}
        isOpen={showGroundingDrawer}
        onClose={() => setShowGroundingDrawer(false)}
      />
    </div>
  );
}
