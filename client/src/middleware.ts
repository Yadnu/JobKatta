import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/candidate', '/employer'];
const SESSION_COOKIE = 'jk-has-session';

export function middleware(request: NextRequest) {
  const { pathname, href } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === '1';
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/auth/login', href);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/candidate/:path*', '/employer/:path*'],
};
