import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Root redirect
  if (pathname === '/') {
    const token = req.cookies.get('bookleaf_token')?.value;
    if (token) {
      const session = await verifySession(token);
      if (session?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/ops/queue', req.url));
      }
      if (session?.role === 'AUTHOR') {
        return NextResponse.redirect(new URL('/portal/dashboard', req.url));
      }
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protect Author Portal (/portal/*)
  if (pathname.startsWith('/portal')) {
    const token = req.cookies.get('bookleaf_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifySession(token);
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Operations Command Center (/ops/*)
  if (pathname.startsWith('/ops')) {
    const token = req.cookies.get('bookleaf_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifySession(token);
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization check: strictly block Authors
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/portal/dashboard', req.url));
    }
  }

  // If already logged in and visiting /login, redirect to their home
  if (pathname === '/login') {
    const token = req.cookies.get('bookleaf_token')?.value;
    if (token) {
      const session = await verifySession(token);
      if (session?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/ops/queue', req.url));
      }
      if (session?.role === 'AUTHOR') {
        return NextResponse.redirect(new URL('/portal/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/portal/:path*', '/ops/:path*'],
};
