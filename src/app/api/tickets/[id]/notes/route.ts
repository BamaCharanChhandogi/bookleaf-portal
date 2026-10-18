import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { broadcastTicketUpdate } from '@/lib/sse';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminName, note } = await req.json();

    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Note content cannot be empty' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const internalNote = await prisma.internalNote.create({
      data: {
        ticketId: params.id,
        adminName: adminName || 'Admin Team',
        note: note.trim(),
      },
    });

    broadcastTicketUpdate({
      type: 'NOTE_ADDED',
      ticketId: ticket.id,
      authorId: ticket.authorId,
      data: internalNote,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ note: internalNote }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create internal note' }, { status: 500 });
  }
}
