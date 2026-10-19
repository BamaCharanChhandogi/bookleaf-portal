import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { broadcastTicketUpdate } from '@/lib/sse';
import { generateAIDraftResponse } from '@/lib/ai/gemini';
import { verifySession } from '@/lib/session';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('bookleaf_token')?.value;
    const session = token ? await verifySession(token) : null;

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        author: {
          include: {
            books: true,
          },
        },
        book: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        internalNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // RBAC: Authors can ONLY view their own tickets
    if (session?.role === 'AUTHOR' && ticket.authorId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized: Access to this ticket is restricted' }, { status: 403 });
    }

    // Data Privacy: internal notes and internal AI drafts are hidden from authors
    let sanitizedTicket: any = ticket;
    if (session?.role === 'AUTHOR') {
      const { internalNotes, aiDraftResponse, aiGroundingPolicy, ...safeData } = ticket;
      sanitizedTicket = safeData;
    }

    return NextResponse.json({ ticket: sanitizedTicket });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, priority, category, assignedTo, aiDraftResponse } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (priority) dataToUpdate.priority = priority;
    if (category) dataToUpdate.category = category;
    if (assignedTo !== undefined) dataToUpdate.assignedTo = assignedTo;
    if (aiDraftResponse !== undefined) dataToUpdate.aiDraftResponse = aiDraftResponse;

    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        author: true,
        book: true,
        messages: { orderBy: { createdAt: 'asc' } },
        internalNotes: { orderBy: { createdAt: 'desc' } },
      },
    });

    broadcastTicketUpdate({
      type: 'TICKET_UPDATED',
      ticketId: updatedTicket.id,
      authorId: updatedTicket.authorId,
      data: updatedTicket,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('Ticket update error:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
