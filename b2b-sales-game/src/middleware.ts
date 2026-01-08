import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Check if password protection is enabled via env var
  const password = process.env.GAME_ACCESS_PASSWORD;
  
  // If no password set, allow access
  if (!password) {
      return NextResponse.next();
  }

  // Basic Auth implementation
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    // Decode base64
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':');

    // Check password (username ignored)
    if (pwd === password) {
      return NextResponse.next();
    }
  }

  // If missing or incorrect, return 401 to trigger browser login prompt
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint if exists)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - avatars (public assets)
     * - public files with extensions (e.g. .svg, .png, .jpg)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|avatars|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
