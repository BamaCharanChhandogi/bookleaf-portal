import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.author.findUnique({
      where: { email },
      include: {
        books: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        joinedDate: user.joinedDate,
        bookCount: user.books.length,
      },
    });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        _count: {
          select: { books: true, tickets: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ authors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}
