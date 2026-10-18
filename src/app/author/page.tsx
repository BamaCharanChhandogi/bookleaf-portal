'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  MessageSquare,
  Send,
  TrendingUp,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { ThreeDBookCard } from '@/components/editorial/ThreeDBookCard';
import { ProductionPipelineStepper } from '@/components/editorial/ProductionPipelineStepper';
import { RoyaltyBreakdownModal } from '@/components/editorial/RoyaltyBreakdownModal';

interface Book {
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
  lastRoyaltyPayoutDate: string | null;
  printPartner: string | null;
  availableOn: string[];
}

interface TicketMessage {
  id: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  book?: {
    id: string;
    title: string;
  } | null;
  messages: TicketMessage[];
}

function AuthorPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeAuthorId = searchParams.get('authorId') || 'AUTH001';

  const [currentAuthor, setCurrentAuthor] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeLedgerBook, setActiveLedgerBook] = useState<Book | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>('GENERAL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New Message State
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const loadData = async (authorId: string) => {
    try {
      setLoading(true);

      // Fetch author profile from accounts list
      const authRes = await fetch('/api/auth');
      const authData = await authRes.json();
      const author = authData.authors?.find((a: any) => a.id === authorId) || authData.authors?.[1];
      setCurrentAuthor(author);

      // Fetch author books
      const targetId = author ? author.id : authorId;
      const booksRes = await fetch(`/api/books?authorId=${targetId}`);
      const booksData = await booksRes.json();
      setBooks(booksData.books || []);

      // Fetch author tickets
      const ticketsRes = await fetch(`/api/tickets?authorId=${targetId}`);
      const ticketsData = await ticketsRes.json();
      const loadedTickets = ticketsData.tickets || [];
      setTickets(loadedTickets);

      if (loadedTickets.length > 0) {
        if (!selectedTicket || !loadedTickets.some((t: Ticket) => t.id === selectedTicket.id)) {
          setSelectedTicket(loadedTickets[0]);
        } else {
          const fresh = loadedTickets.find((t: Ticket) => t.id === selectedTicket.id);
          if (fresh) setSelectedTicket(fresh);
        }
      } else {
        setSelectedTicket(null);
      }
    } catch (e) {
      console.error('Error loading author portal data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeAuthorId);
  }, [activeAuthorId]);

  // Real-Time SSE Listener
  useEffect(() => {
    const eventSource = new EventSource('/api/tickets/stream');
    eventSource.addEventListener('update', (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (currentAuthor && payload.authorId === currentAuthor.id) {
          loadData(currentAuthor.id);
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [currentAuthor?.id, selectedTicket?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !currentAuthor) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentAuthor.id,
          bookId: selectedBookId,
          subject,
          description,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setSubject('');
        setDescription('');
        setSelectedBookId('GENERAL');
        setShowNewTicketModal(false);
        await loadData(currentAuthor.id);
        setSelectedTicket(result.ticket);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim() || !currentAuthor) return;

    try {
      setSendingReply(true);
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: 'AUTHOR',
          senderName: currentAuthor.name,
          message: replyMessage,
        }),
      });

      if (res.ok) {
        setReplyMessage('');
        await loadData(currentAuthor.id);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  // Financial aggregates
  const totalEarned = books.reduce((acc, b) => acc + (b.totalRoyaltyEarned || 0), 0);
  const totalPaid = books.reduce((acc, b) => acc + (b.royaltyPaid || 0), 0);
  const totalPending = books.reduce((acc, b) => acc + (b.royaltyPending || 0), 0);
  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopiesSold || 0), 0);

  // Check for books in production to display the pipeline stepper
  const inProductionBook = books.find((b) => b.status !== 'Published & Live');

  if (loading && !currentAuthor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-editorial text-ink-700">Accessing Author Publishing Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="flex flex-col justify-between border-b border-parchment-300 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              Author Publishing Desk
            </span>
            <span className="rounded bg-parchment-200 px-2 py-0.5 text-[10px] font-mono text-ink-700">
              ID: {currentAuthor?.id}
            </span>
          </div>
          <h1 className="font-editorial mt-1 text-3xl font-extrabold text-ink-950 sm:text-4xl">
            {currentAuthor?.name}
          </h1>
          <p className="mt-1 text-xs text-ink-600">
            {currentAuthor?.email} · {currentAuthor?.city || 'India'}
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-3 md:mt-0">
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-900"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit a Support Query</span>
          </button>
        </div>
      </div>

      {/* Financial Ledger & Threshold Progress Gauge */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earned */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Royalty Accrued</span>
            <TrendingUp className="h-4 w-4 text-forest-700" />
          </div>
          <p className="font-editorial mt-2 text-2xl font-bold text-ink-950">
            ₹{totalEarned.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-ink-600">80% author net profit share</p>
        </div>

        {/* Royalty Paid */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Disbursed to Bank</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="font-editorial mt-2 text-2xl font-bold text-ink-950">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-ink-600">Quarterly bank transfers</p>
        </div>

        {/* Royalty Pending with ₹1,000 Threshold Gauge */}
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

        {/* Copies Sold */}
        <div className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-ink-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Copies Sold</span>
            <BookOpen className="h-4 w-4 text-ink-700" />
          </div>
          <p className="font-editorial mt-2 text-2xl font-bold text-ink-950">
            {totalCopies.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-600">Amazon, Flipkart & BookLeaf Store</p>
        </div>
      </div>

      {/* Production Pipeline Banner for Books in Progress */}
      {inProductionBook && (
        <div className="mt-8">
          <ProductionPipelineStepper currentStage={inProductionBook.status} />
        </div>
      )}

      {/* SECTION 1: 3D Bookshelf */}
      <div className="mt-12">
        <div className="flex items-center justify-between border-b border-parchment-300 pb-4">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-ink-950">
              The Bookshelf ({books.length})
            </h2>
            <p className="text-xs text-ink-600">
              Published titles, dimensional bindings, and real-time sales ledgers
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <ThreeDBookCard
              key={book.id}
              book={book}
              onOpenLedger={() => setActiveLedgerBook(book)}
              onRaiseQuery={() => {
                setSelectedBookId(book.id);
                setShowNewTicketModal(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: Support Ticket Desk */}
      <div className="mt-16 border-t border-parchment-300 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-editorial text-2xl font-bold text-ink-950">
                Support Ticket Desk
              </h2>
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Live Real-Time Stream</span>
              </span>
            </div>
            <p className="text-xs text-ink-600">
              Replies from BookLeaf Operations sync instantly to this screen without browser reload
            </p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-parchment-300 bg-white p-12 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-ink-400" />
            <h3 className="font-editorial mt-3 text-lg font-bold text-ink-900">
              No active support tickets
            </h3>
            <p className="mt-1 text-xs text-ink-600">
              Need assistance with royalties, ISBNs, or print quality? Click the button above.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            {/* Ticket List */}
            <div className="space-y-3 lg:col-span-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selectedTicket?.id === t.id
                      ? 'border-forest-700 bg-forest-50/40 shadow-sm ring-1 ring-forest-700/20'
                      : 'border-parchment-300 bg-white hover:border-parchment-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-ink-500">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
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
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-ink-900 line-clamp-1">
                    {t.subject}
                  </h4>

                  <p className="mt-1 text-xs text-ink-600 line-clamp-2">
                    {t.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-ink-500">
                    <span className="font-semibold text-forest-700">
                      {t.category}
                    </span>
                    <span>{t.messages.length} message(s)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Conversation Thread */}
            <div className="flex flex-col justify-between rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm lg:col-span-8 min-h-[500px]">
              {selectedTicket ? (
                <>
                  <div>
                    <div className="border-b border-parchment-200 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="rounded bg-parchment-100 px-2 py-0.5 text-[10px] font-bold text-forest-800">
                              {selectedTicket.category}
                            </span>
                            {selectedTicket.book && (
                              <span className="text-xs text-ink-600">
                                📖 Book: <strong>{selectedTicket.book.title}</strong>
                              </span>
                            )}
                          </div>
                          <h3 className="font-editorial mt-2 text-xl font-bold text-ink-950">
                            {selectedTicket.subject}
                          </h3>
                        </div>

                        <span
                          className={`rounded px-2.5 py-1 text-xs font-bold ${
                            selectedTicket.status === 'OPEN'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedTicket.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Status: {selectedTicket.status}
                        </span>
                      </div>
                    </div>

                    <div className="my-4 max-h-[380px] space-y-4 overflow-y-auto pr-2">
                      {selectedTicket.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex flex-col ${
                            m.senderRole === 'AUTHOR' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div className="flex items-center space-x-2 text-[10px] text-ink-500 mb-1">
                            <span className="font-semibold text-ink-800">
                              {m.senderName} ({m.senderRole === 'AUTHOR' ? 'You' : 'BookLeaf Ops Desk'})
                            </span>
                            <span>•</span>
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                              m.senderRole === 'AUTHOR'
                                ? 'bg-ink-900 text-white rounded-tr-none'
                                : 'border border-parchment-300 bg-parchment-50 text-ink-900 rounded-tl-none shadow-xs'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSendReply} className="mt-4 border-t border-parchment-200 pt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Write your response to the operations team..."
                        className="flex-1 rounded-xl border border-parchment-300 px-4 py-2.5 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sendingReply || !replyMessage.trim()}
                        className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-forest-900 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink-500">
                  Select a ticket to view conversation
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Royalty Breakdown */}
      {activeLedgerBook && (
        <RoyaltyBreakdownModal
          book={activeLedgerBook}
          onClose={() => setActiveLedgerBook(null)}
        />
      )}

      {/* Modal: New Ticket */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-parchment-300 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-ink-950">
                  Submit a Support Query
                </h3>
                <p className="text-xs text-ink-600">
                  Direct inquiry to BookLeaf publishing and royalties desk
                </p>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-ink-500 hover:text-ink-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-800">
                  Select Associated Title
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-parchment-300 px-3 py-2 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
                >
                  <option value="GENERAL">General / Account Level Query</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      📖 {b.title} ({b.isbn})
                    </option>
                  ))}
                </select>
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
                  placeholder="e.g. Inquiring regarding Q4 royalty disbursement"
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
                  placeholder="Provide details about your query..."
                  className="mt-1 w-full rounded-xl border border-parchment-300 px-3 py-2 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-parchment-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
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

export default function AuthorPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Studio...</div>}>
      <AuthorPortalContent />
    </Suspense>
  );
}
