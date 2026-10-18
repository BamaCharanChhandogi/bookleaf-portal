import { NextRequest, NextResponse } from 'next/server';
import { generateAIDraftResponse, classifyTicket } from '@/lib/ai/gemini';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { ticketId, customPromptModifier } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        author: true,
        book: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const draftResult = await generateAIDraftResponse(
      {
        authorName: ticket.author.name,
        authorEmail: ticket.author.email,
        bookTitle: ticket.book?.title || null,
        bookIsbn: ticket.book?.isbn || null,
        bookStatus: ticket.book?.status || null,
        totalSold: ticket.book?.totalCopiesSold ?? null,
        royaltyPending: ticket.book?.royaltyPending ?? null,
        lastPayoutDate: ticket.book?.lastRoyaltyPayoutDate?.toISOString() || null,
        subject: ticket.subject,
        description: ticket.description,
      },
      ticket.category
    );

    // Save regenerated draft to ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        aiDraftResponse: draftResult.draftResponse,
        aiGroundingPolicy: draftResult.citedPolicy,
      },
    });

    return NextResponse.json({ draftResult });
  } catch (error) {
    console.error('AI Draft regeneration error:', error);
    return NextResponse.json({ error: 'Failed to generate AI draft' }, { status: 500 });
  }
}
