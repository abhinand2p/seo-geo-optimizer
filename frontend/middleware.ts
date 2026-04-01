import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(path => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  // Read the token we store in a cookie (set by the frontend after login)
  const token = request.cookies.get('seo_geo_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
