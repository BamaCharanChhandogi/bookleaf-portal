import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookleaf_token')?.value;
    const session = token ? await verifySession(token) : null;

    const { searchParams } = new URL(req.url);
    const requestedAuthorId = searchParams.get('authorId');

    const whereClause: any = {};

    // RBAC: Authors can ONLY access their own catalog; Admins can access all or filter by author
    if (session?.role === 'AUTHOR') {
      whereClause.authorId = session.id;
    } else if (requestedAuthorId) {
      whereClause.authorId = requestedAuthorId;
    }

    const books = await prisma.book.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    const parsedBooks = books.map((b) => ({
      ...b,
      availableOn: JSON.parse(b.availableOn || '[]'),
    }));

    return NextResponse.json({ books: parsedBooks });
  } catch (error) {
    console.error('Books API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve books' }, { status: 500 });
  }
}
