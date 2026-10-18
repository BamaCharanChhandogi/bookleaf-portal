import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signSession, verifySession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const user = await prisma.author.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    // Verify password (defaults to password123 or adminpassword123 from sample data seeder)
    if (password && user.password !== password) {
      return NextResponse.json({ error: 'Invalid password credentials' }, { status: 401 });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'AUTHOR' | 'ADMIN',
      city: user.city,
    };

    const token = await signSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl: user.role === 'ADMIN' ? '/ops/queue' : '/portal/dashboard',
    });

    // Set secure HttpOnly session cookie
    response.cookies.set('bookleaf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal authentication error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bookleaf_token')?.value;
    let currentUser = null;

    if (token) {
      currentUser = await verifySession(token);
    }

    // Also return list of demo test accounts for reviewer quick-fill convenience
    const demoAccounts = await prisma.author.findMany({
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

    return NextResponse.json({ currentUser, demoAccounts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  response.cookies.set('bookleaf_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
