import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages that are allowed during pre-launch
const ALLOWED_PATHS = [
  '/',
  '/launch',
  '/api/launch/signup',
  '/api/health',
  '/cookies',
  '/disclaimer',
  '/privacy',
  '/terms',
]

// Paths that should always be allowed (static assets, etc.)
const ALWAYS_ALLOWED_PREFIXES = [
  '/_next',
  '/favicon',
  '/images',
  '/fonts',
  '/manifest',
  '/sw.js',
  '/robots.txt',
  '/sitemap.xml',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow static assets and internal Next.js routes
  if (ALWAYS_ALLOWED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Allow exact matches for allowed paths
  if (ALLOWED_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Redirect /launch to root since they're the same now
  if (pathname === '/launch') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect all other paths to the launch page
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
