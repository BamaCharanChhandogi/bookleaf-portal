import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { classifyTicket, generateAIDraftResponse } from '@/lib/ai/gemini';
import { broadcastTicketUpdate } from '@/lib/sse';
import { verifySession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookleaf_token')?.value;
    const session = token ? await verifySession(token) : null;

    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('authorId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const where: any = {};

    // RBAC: Authors can ONLY see their own tickets; Admins see all
    if (session?.role === 'AUTHOR') {
      where.authorId = session.id;
    } else if (authorId) {
      where.authorId = authorId;
    }

    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (priority && priority !== 'ALL') where.priority = priority;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true, phone: true, city: true },
        },
        book: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        internalNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Data Privacy: Strip internalNotes if caller is an author
    const sanitizedTickets = session?.role === 'AUTHOR'
      ? tickets.map(({ internalNotes, ...rest }) => rest)
      : tickets;

    return NextResponse.json({ tickets: sanitizedTickets });
  } catch (error) {
    console.error('Tickets GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authorId, bookId, subject, description, attachmentUrl } = body;

    if (!authorId || !subject || !description) {
      return NextResponse.json(
        { error: 'authorId, subject, and description are required fields' },
        { status: 400 }
      );
    }

    // 1. Author and optional book context
    const author = await prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    let book = null;
    if (bookId && bookId !== 'GENERAL') {
      book = await prisma.book.findUnique({
        where: { id: bookId },
      });
    }

    // 2. AI Auto-Classification & Priority Scoring
    const aiClassification = await classifyTicket(subject, description);

    // 3. Pre-generate AI Co-pilot Draft Response based on BookLeaf Knowledge Base
    const aiDraft = await generateAIDraftResponse(
      {
        authorName: author.name,
        authorEmail: author.email,
        bookTitle: book?.title || null,
        bookIsbn: book?.isbn || null,
        bookStatus: book?.status || null,
        totalSold: book?.totalCopiesSold ?? null,
        royaltyPending: book?.royaltyPending ?? null,
        lastPayoutDate: book?.lastRoyaltyPayoutDate?.toISOString() || null,
        subject,
        description,
      },
      aiClassification.category
    );

    // 4. Save to Database
    const ticket = await prisma.ticket.create({
      data: {
        authorId: author.id,
        bookId: book?.id || null,
        subject,
        description,
        status: 'OPEN',
        category: aiClassification.category,
        priority: aiClassification.priority,
        aiSuggestedCategory: aiClassification.category,
        aiSuggestedPriority: aiClassification.priority,
        aiPriorityReason: aiClassification.priorityReason,
        aiDraftResponse: aiDraft.draftResponse,
        aiGroundingPolicy: aiDraft.citedPolicy,
        attachmentUrl: attachmentUrl || null,
        messages: {
          create: [
            {
              senderRole: 'AUTHOR',
              senderName: author.name,
              message: description,
            },
          ],
        },
      },
      include: {
        author: true,
        book: true,
        messages: true,
        internalNotes: true,
      },
    });

    // 5. Broadcast real-time SSE event to all connected portals
    broadcastTicketUpdate({
      type: 'TICKET_CREATED',
      ticketId: ticket.id,
      authorId: ticket.authorId,
      data: ticket,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Tickets POST error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
