'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  BookOpen,
  Clock,
  Shield,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface TicketDetailPageProps {
  params: { id: string };
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTicket = async () => {
    try {
      const [authRes, ticketRes] = await Promise.all([
        fetch('/api/auth'),
        fetch(`/api/tickets/${params.id}`),
      ]);

      const authData = await authRes.json();
      const ticketData = await ticketRes.json();

      setCurrentUser(authData.currentUser);
      setTicket(ticketData.ticket);
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
  }, [params.id]);

  // Real-Time Server-Sent Events Listener
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticket) return;

    try {
      setSending(true);
      const res = await fetch(`/api/tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: 'AUTHOR',
          senderName: currentUser?.name || ticket.author?.name || 'Author',
          message: replyMessage.trim(),
        }),
      });

      if (res.ok) {
        setReplyMessage('');
        await loadTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
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
        <p className="text-sm text-ink-600">Ticket not found or access restricted.</p>
        <Link href="/portal/tickets" className="text-xs font-bold text-forest-800 underline">
          ← Return to Support Queries
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/portal/tickets"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-ink-600 hover:text-forest-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Inquiries</span>
        </Link>
      </div>

      {/* Ticket Header Card */}
      <div className="rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-parchment-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="rounded bg-forest-50 px-2 py-0.5 text-[10px] font-bold text-forest-800">
                {ticket.category}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  ticket.status === 'OPEN'
                    ? 'bg-amber-100 text-amber-800'
                    : ticket.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {ticket.status}
              </span>
              <span className="text-[10px] text-ink-500 font-mono">
                #{ticket.id.slice(-6)}
              </span>
            </div>
            <h1 className="font-editorial text-2xl font-bold text-ink-950">
              {ticket.subject}
            </h1>
          </div>

          <div className="text-left sm:text-right text-[11px] text-ink-500">
            <p>Created on {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            {ticket.book && (
              <p className="font-semibold text-forest-800 mt-0.5">
                📖 {ticket.book.title}
              </p>
            )}
          </div>
        </div>

        {/* Real-Time Live Sync Status Banner */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-ink-600 bg-parchment-50 p-2.5 rounded-xl border border-parchment-200">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-semibold text-emerald-800">Real-Time Channel Active:</span>
            <span>Operations responses sync automatically without page refreshes.</span>
          </span>
        </div>
      </div>

      {/* Message Thread */}
      <div className="rounded-2xl border border-parchment-300 bg-white p-6 shadow-sm space-y-6">
        <h3 className="font-editorial text-lg font-bold text-ink-950 border-b border-parchment-200 pb-3">
          Communication History
        </h3>

        <div className="space-y-4">
          {ticket.messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.senderRole === 'AUTHOR' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center space-x-2 text-[10px] text-ink-500 mb-1">
                <span className="font-semibold text-ink-900">
                  {m.senderName} ({m.senderRole === 'AUTHOR' ? 'You' : 'BookLeaf Operations'})
                </span>
                <span>•</span>
                <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.senderRole === 'AUTHOR'
                    ? 'bg-ink-900 text-white rounded-tr-none'
                    : 'border border-parchment-300 bg-parchment-50 text-ink-950 rounded-tl-none shadow-xs'
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
        </div>

        {/* Reply Input Box */}
        <form onSubmit={handleSendReply} className="border-t border-parchment-200 pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your response to the BookLeaf operations team..."
              className="flex-1 rounded-xl border border-parchment-300 px-4 py-2.5 text-xs text-ink-900 focus:border-forest-700 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !replyMessage.trim()}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-forest-900 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
