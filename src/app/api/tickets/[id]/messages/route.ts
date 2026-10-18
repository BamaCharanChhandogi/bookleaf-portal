import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { broadcastTicketUpdate } from '@/lib/sse';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { senderRole, senderName, message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Add message
    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        senderRole: senderRole || 'AUTHOR',
        senderName: senderName || 'User',
        message: message.trim(),
      },
    });

    // If an admin replies, update status to IN_PROGRESS if currently OPEN
    let updatedStatus = ticket.status;
    if (senderRole === 'ADMIN' && ticket.status === 'OPEN') {
      updatedStatus = 'IN_PROGRESS';
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Broadcast message to real-time stream
    broadcastTicketUpdate({
      type: 'MESSAGE_SENT',
      ticketId: ticket.id,
      authorId: ticket.authorId,
      data: {
        message: newMessage,
        status: updatedStatus,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: newMessage, status: updatedStatus }, { status: 201 });
  } catch (error) {
    console.error('Message create error:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
