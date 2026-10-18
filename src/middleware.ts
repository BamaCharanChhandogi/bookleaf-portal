import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If user visits root '/', redirect to author dashboard by default
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/author', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
