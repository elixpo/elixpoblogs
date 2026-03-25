import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/callback',
  '/api/auth/callback',
  '/api/auth/logout',
  '/_next',
  '/logo.png',
  '/favicon.ico',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get('lixblogs_session')?.value;
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
