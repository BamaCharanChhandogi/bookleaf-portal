import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('authorId');

    const whereClause: any = {};
    if (authorId) {
      whereClause.authorId = authorId;
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
