'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Send,
  User,
  Clock,
  BookOpen,
  IndianRupee,
  RefreshCw,
  Bookmark,
  ExternalLink,
  Flame,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { PolicyGroundingDrawer } from '@/components/editorial/PolicyGroundingDrawer';

const CATEGORIES = [
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry',
];

interface OpsTicketDetailPageProps {
  params: { id: string };
}

export default function OpsTicketDetailPage({ params }: OpsTicketDetailPageProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Co-Pilot State
  const [editableDraft, setEditableDraft] = useState('');
  const [draftInitialized, setDraftInitialized] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [sendingDraft, setSendingDraft] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [activeTone, setActiveTone] = useState<'EMPATHETIC' | 'CONCISE' | 'URGENT'>('EMPATHETIC');
  const [showGroundingDrawer, setShowGroundingDrawer] = useState(false);

  // Quick Reply in Chat Thread
  const [quickReply, setQuickReply] = useState('');
  const [sendingQuickReply, setSendingQuickReply] = useState(false);

  // Internal Notes State
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Status/Priority Overrides
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentPriority, setCurrentPriority] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');

  const loadTicket = async () => {
    try {
      const [authRes, ticketRes] = await Promise.all([
        fetch('/api/auth'),
        fetch(`/api/tickets/${params.id}`),
      ]);

      const authData = await authRes.json();
      const ticketData = await ticketRes.json();

      setCurrentUser(authData.currentUser);
      const t = ticketData.ticket;
      setTicket(t);

      if (t) {
        if (!draftInitialized) {
          setEditableDraft(t.aiDraftResponse || '');
          setDraftInitialized(true);
        }
        setCurrentStatus(t.status);
        setCurrentPriority(t.priority);
        setCurrentCategory(t.category);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // 5s real-time polling fallback
    const pollInterval = setInterval(() => {
      loadTicket();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [params.id, draftInitialized]);

  // Real-Time SSE Listener
  useEffect(() => {
    const eventSource = new EventSource('/api/tickets/stream');
    eventSource.addEventListener('update', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.ticketId === params.id) {
          loadTicket();
        }
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [params.id]);

  const handleToneChange = (tone: 'EMPATHETIC' | 'CONCISE' | 'URGENT') => {
    setActiveTone(tone);
    if (!editableDraft || !ticket) return;

    const firstName = ticket.author.name.split(' ')[0];

    if (tone === 'CONCISE') {
      setEditableDraft(
        `Dear ${firstName},\n\nWe have reviewed your request regarding "${ticket.subject}". Under BookLeaf operating protocol, your query has been routed to our production desk. We will confirm completion within 48 hours.\n\nBest regards,\nBookLeaf Operations Desk`
      );
    } else if (tone === 'URGENT') {
      setEditableDraft(
        `Dear ${firstName},\n\nWe sincerely apologize for this inconvenience. We treat this as a high-priority operational matter and have escalated this ticket to our senior department supervisors for immediate resolution within 24 hours.\n\nWarm regards,\nBookLeaf Operations Lead`
      );
    } else {
      setEditableDraft(ticket.aiDraftResponse || '');
    }
  };

  const insertSnippet = (snippet: string) => {
    setEditableDraft((prev) => `${prev}\n\n${snippet}`);
  };

  const handleSendDraft = async () => {
    if (!editableDraft.trim()) return;
    try {
      setSendingDraft(true);
      const res = await fetch(`/api/tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: 'ADMIN',
          senderName: currentUser?.name || 'Aditi Rao (Senior Ops Lead)',
          message: editableDraft.trim(),
        }),
      });

      if (res.ok) {
        setEditableDraft('');
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 5000);
        await loadTicket();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to dispatch response');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingDraft(false);
    }
  };

  const handleSendQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReply.trim()) return;
    try {
      setSendingQuickReply(true);
      const res = await fetch(`/api/tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: 'ADMIN',
          senderName: currentUser?.name || 'Aditi Rao (Senior Ops Lead)',
          message: quickReply.trim(),
        }),
      });

      if (res.ok) {
        setQuickReply('');
        await loadTicket();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingQuickReply(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setAddingNote(true);
      const res = await fetch(`/api/tickets/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: currentUser?.name || 'Aditi Rao',
          note: newNote.trim(),
        }),
      });

      if (res.ok) {
        setNewNote('');
        await loadTicket();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateMeta = async (updates: any) => {
    try {
      const res = await fetch(`/api/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await loadTicket();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-forest-700 border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-ink-600">Ticket not found.</p>
        <Link href="/ops/queue" className="text-xs font-bold text-forest-800 underline">
          ← Return to Triage Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/ops/queue"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-ink-600 hover:text-forest-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Triage Queue</span>
        </Link>
      </div>

      {/* 3-Column Split Workbench */}
      <div className="grid grid-cols-12 gap-6">
        {/* COLUMN 1: Conversation History & Metadata Overrides (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-between rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm min-h-[760px]">
          <div>
            <div className="border-b border-parchment-200 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-editorial text-xl font-bold text-ink-950">
                    {ticket.subject}
                  </h2>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Ticket #{ticket.id.slice(-6)} · Raised by {ticket.author.name}
                  </p>
                </div>

                <div className="relative inline-flex items-center">
                  <select
                    value={currentStatus}
                    onChange={(e) => {
                      setCurrentStatus(e.target.value);
                      handleUpdateMeta({ status: e.target.value });
                    }}
                    className="appearance-none rounded-xl border border-parchment-300 bg-white pl-3 pr-7 py-1.5 text-xs font-bold text-ink-800 shadow-2xs hover:border-parchment-400 focus:border-forest-700 focus:outline-none cursor-pointer"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-ink-400" />
                </div>
              </div>

              {/* Triage Override Controls */}
              <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl bg-parchment-100/70 p-2.5 text-xs">
                <span className="inline-flex items-center space-x-1.5 font-bold text-forest-900 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-forest-700" />
                  <span>Classification:</span>
                </span>

                <div className="relative inline-flex items-center">
                  <select
                    value={currentCategory}
                    onChange={(e) => {
                      setCurrentCategory(e.target.value);
                      handleUpdateMeta({ category: e.target.value });
                    }}
                    className="appearance-none rounded-lg border border-parchment-300 bg-white pl-2.5 pr-6 py-1 text-xs font-medium text-ink-800 hover:border-parchment-400 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-ink-400" />
                </div>

                <div className="relative inline-flex items-center">
                  <select
                    value={currentPriority}
                    onChange={(e) => {
                      setCurrentPriority(e.target.value);
                      handleUpdateMeta({ priority: e.target.value });
                    }}
                    className="appearance-none rounded-lg border border-parchment-300 bg-white pl-2.5 pr-6 py-1 text-xs font-bold text-ink-800 hover:border-parchment-400 focus:outline-none cursor-pointer"
                  >
                    <option value="CRITICAL">🔴 Critical</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="MEDIUM">🔵 Medium</option>
                    <option value="LOW">⚪ Low</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-ink-400" />
                </div>

                <button
                  onClick={() => handleUpdateMeta({ assignedTo: currentUser?.name || 'Aditi Rao' })}
                  className="ml-auto inline-flex items-center rounded-lg border border-forest-600/20 bg-white px-2.5 py-1 text-[11px] font-bold text-forest-800 shadow-2xs hover:bg-forest-50 transition"
                >
                  {ticket.assignedTo ? `Lead: ${ticket.assignedTo}` : '👉 Claim Ticket'}
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="my-4 max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {ticket.messages.map((m: any) => (
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
                        : 'border border-parchment-300 bg-parchment-50 text-ink-950 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Reply Composer in Column 1 */}
            <form onSubmit={handleSendQuickReply} className="mt-4 border-t border-parchment-200 pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickReply}
                  onChange={(e) => setQuickReply(e.target.value)}
                  placeholder="Type a quick direct reply to author..."
                  className="flex-1 rounded-xl border border-parchment-300 bg-parchment-50 px-3.5 py-2 text-xs text-ink-950 placeholder:text-ink-400 focus:border-forest-700 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingQuickReply || !quickReply.trim()}
                  className="inline-flex items-center space-x-1 rounded-xl bg-forest-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-900 disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  <span>{sendingQuickReply ? 'Sending...' : 'Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUMN 2: AI Co-Pilot 2.0 Response Composer (4 cols) */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-forest-600/30 bg-forest-50/20 p-6 shadow-sm flex flex-col justify-between min-h-[760px]">
          <div>
            <div className="flex items-center justify-between border-b border-forest-600/20 pb-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-forest-900">
                <Sparkles className="h-4 w-4 text-forest-700" />
                <span>Policy-Grounded Draft Assistant</span>
              </div>

              <button
                onClick={() => setShowGroundingDrawer(true)}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-forest-700 hover:underline"
              >
                <span>View Grounding Policy</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            {/* Tone Selector */}
            <div className="mt-3 flex items-center space-x-1.5">
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

            {/* Canned Policy Snippets */}
            <div className="mt-3 flex flex-wrap gap-1.5">
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

            {/* Response Draft Textarea */}
            <textarea
              rows={14}
              value={editableDraft}
              onChange={(e) => setEditableDraft(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-parchment-300 bg-white p-3.5 text-xs leading-relaxed text-ink-900 shadow-inner focus:border-forest-700 focus:outline-none"
              placeholder="Review AI response draft or type custom message..."
            />

            {/* Send Success Banner */}
            {sendSuccess && (
              <div className="mt-2.5 flex items-center space-x-1.5 rounded-xl bg-forest-100/80 p-2.5 text-xs font-semibold text-forest-900 border border-forest-600/30">
                <CheckCircle2 className="h-4 w-4 text-forest-700 shrink-0" />
                <span>Response dispatched to author and saved to thread!</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-forest-600/20 flex items-center justify-between">
            <span className="text-[10px] text-ink-500">
              Calibrate draft before dispatching to author
            </span>

            <button
              onClick={handleSendDraft}
              disabled={sendingDraft || !editableDraft.trim()}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest-900 disabled:opacity-50 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sendingDraft ? 'Sending...' : 'Approve & Send to Author'}</span>
            </button>
          </div>
        </div>

        {/* COLUMN 3: Author Dossier & Private Internal Notes (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
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
                <p className="font-semibold text-ink-900">{ticket.author.name}</p>
              </div>
              <div>
                <span className="text-ink-500">Email & Location</span>
                <p className="text-ink-800">{ticket.author.email}</p>
                <p className="text-ink-600">{ticket.author.city || 'India'}</p>
              </div>
            </div>

            {ticket.book && (
              <div className="mt-4 border-t border-parchment-200 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                  Associated Title
                </span>
                <h4 className="font-editorial mt-1 text-sm font-bold text-ink-900">
                  {ticket.book.title}
                </h4>
                <p className="text-[10px] font-mono text-ink-500">
                  ISBN: {ticket.book.isbn}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-parchment-50 p-2">
                    <span className="text-ink-500">Copies Sold</span>
                    <p className="font-bold text-ink-900">{ticket.book.totalCopiesSold}</p>
                  </div>
                  <div className="rounded-lg bg-parchment-50 p-2">
                    <span className="text-ink-500">Pending</span>
                    <p className="font-bold text-gilded-600">₹{ticket.book.royaltyPending}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-parchment-200 pb-3">
              <Bookmark className="h-4 w-4 text-gilded-600" />
              <h3 className="font-editorial text-sm font-bold text-ink-950">
                Internal Ops Notes
              </h3>
            </div>

            <div className="my-3 max-h-44 space-y-2 overflow-y-auto">
              {ticket.internalNotes?.length === 0 ? (
                <p className="text-xs text-ink-400 italic">No internal notes added yet</p>
              ) : (
                ticket.internalNotes.map((note: any) => (
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
        </div>
      </div>

      {/* Policy Grounding Slide-Over */}
      <PolicyGroundingDrawer
        policyTitle={ticket.category}
        isOpen={showGroundingDrawer}
        onClose={() => setShowGroundingDrawer(false)}
      />
    </div>
  );
}
