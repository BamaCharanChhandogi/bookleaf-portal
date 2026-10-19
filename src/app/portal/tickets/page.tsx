'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  PlusCircle,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Paperclip,
  UploadCloud,
  X,
} from 'lucide-react';

function TicketsContent() {
  const searchParams = useSearchParams();
  const preselectedBookId = searchParams.get('bookId') || 'GENERAL';

  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(preselectedBookId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (preselectedBookId !== 'GENERAL') {
      setSelectedBookId(preselectedBookId);
      setShowModal(true);
    }
  }, [preselectedBookId]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !user) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          bookId: selectedBookId === 'GENERAL' ? null : selectedBookId,
          subject: subject.trim(),
          description: description.trim(),
          attachmentUrl: attachmentName ? `https://storage.bookleafpub.com/attachments/${attachmentName}` : null,
        }),
      });

      if (res.ok) {
        setSubject('');
        setDescription('');
        setSelectedBookId('GENERAL');
        setAttachmentName(null);
        setShowModal(false);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-forest-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col justify-between border-b border-parchment-300 pb-6 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
            Author Support & Communications
          </span>
          <h1 className="font-editorial mt-1 text-3xl font-extrabold text-ink-950 sm:text-4xl">
            My Support Queries ({tickets.length})
          </h1>
          <p className="mt-1 text-xs text-ink-600">
            Direct communication channel with BookLeaf publishing, printing, and royalties operations
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-3 md:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-900"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit a Support Query</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-parchment-300 bg-white p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-ink-400" />
          <h3 className="font-editorial mt-3 text-lg font-bold text-ink-950">No queries raised yet</h3>
          <p className="mt-1 text-xs text-ink-600 max-w-md mx-auto">
            Need assistance with royalty calculations, quarterly payouts, barcode updates, or physical author copies?
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex items-center space-x-2 rounded-xl bg-forest-800 px-4 py-2 text-xs font-semibold text-white"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Raise Query Now</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/portal/tickets/${t.id}`}
              className="group block rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm transition hover:border-forest-700 hover:shadow-md"
            >
              <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        t.status === 'OPEN'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-[10px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                    {t.book && (
                      <span className="text-xs text-ink-500">
                        • Title: <strong>{t.book.title}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="font-editorial text-base font-bold text-ink-950 group-hover:text-forest-800 transition">
                    {t.subject}
                  </h3>

                  <p className="text-xs text-ink-600 line-clamp-2 max-w-3xl leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-parchment-200 pt-3 sm:mt-0 sm:border-0 sm:pt-0 sm:text-right">
                  <div className="text-[11px] text-ink-500">
                    <p>{new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="font-semibold text-ink-800">{t.messages?.length || 1} message(s)</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-forest-800 transition ml-4 hidden sm:block" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Submit Query Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-parchment-300 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-ink-950">
                  Submit a Support Query
                </h3>
                <p className="text-xs text-ink-600">
                  Direct inquiry to BookLeaf publishing, printing, and royalties desk
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-400 hover:text-ink-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-800">
                  Select Associated Title
                </label>
                <div className="relative mt-1">
                  <select
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-parchment-300 bg-white pl-3.5 pr-8 py-2 text-xs text-ink-900 focus:border-forest-700 focus:outline-none cursor-pointer"
                  >
                    <option value="GENERAL">General / Account Level Query</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        📖 {b.title} ({b.isbn})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. When will my Q4 royalty payout be credited?"
                  className="mt-1 w-full rounded-xl border border-parchment-300 px-3 py-2 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details about your query..."
                  className="mt-1 w-full rounded-xl border border-parchment-300 px-3 py-2 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
                />
              </div>

              {/* Optional File Attachment (UI only per specification) */}
              <div>
                <label className="block text-xs font-semibold text-ink-800">
                  File Attachment <span className="font-normal text-ink-400">(Optional)</span>
                </label>
                <div className="mt-1">
                  {!attachmentName ? (
                    <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-parchment-300 bg-parchment-50/50 p-3.5 transition hover:bg-parchment-100/70 hover:border-forest-600 cursor-pointer">
                      <div className="flex items-center space-x-2 text-ink-600">
                        <UploadCloud className="h-4 w-4 text-forest-700" />
                        <span className="text-xs font-medium">Click to select photo or document</span>
                      </div>
                      <span className="text-[10px] text-ink-400 mt-0.5">PNG, JPG, PDF up to 10MB (e.g. proof of misprint or royalty statement)</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setAttachmentName(file.name);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-forest-600/30 bg-forest-50/50 px-3 py-2 text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <Paperclip className="h-3.5 w-3.5 text-forest-700 shrink-0" />
                        <span className="font-semibold text-forest-900 truncate">{attachmentName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachmentName(null)}
                        className="ml-2 text-ink-400 hover:text-red-600"
                        title="Remove attachment"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-parchment-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-parchment-300 px-4 py-2 text-xs font-medium text-ink-700 hover:bg-parchment-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-forest-800 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest-900 disabled:opacity-50"
                >
                  {submitting ? 'Submitting & Classifying...' : 'Submit Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthorTicketsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-500">Loading Queries...</div>}>
      <TicketsContent />
    </Suspense>
  );
}
