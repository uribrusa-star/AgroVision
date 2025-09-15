
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // No-op middleware, allows all requests to pass through.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png, manifest.json, etc. (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|manifest.json|icons/).*)',
  ],
};
