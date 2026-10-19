import { NextRequest } from 'next/server';
import { ticketEvents, TicketUpdatePayload } from '@/lib/sse';
import { verifySession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('bookleaf_token')?.value;
  const session = token ? await verifySession(token) : null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial heartbeat
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`));

      const listener = (payload: TicketUpdatePayload) => {
        try {
          // Data Isolation: Never broadcast internal notes to author connections
          if (session?.role === 'AUTHOR' && payload.type === 'NOTE_ADDED') {
            return;
          }
          // Tenancy Isolation: Never broadcast updates belonging to another author
          if (session?.role === 'AUTHOR' && payload.authorId && payload.authorId !== session.id) {
            return;
          }

          const data = `event: update\ndata: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (e) {
          console.error('SSE enqueue error:', e);
        }
      };

      ticketEvents.on('ticket_update', listener);

      // Heartbeat interval to prevent socket timeout
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        ticketEvents.off('ticket_update', listener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
