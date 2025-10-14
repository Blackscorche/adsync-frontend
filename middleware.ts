import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/api/auth/login']
  if (publicPaths.some(path => pathname === path || pathname.startsWith('/api/auth'))) {
    return NextResponse.next()
  }

  // Protected routes require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Parse JWT to get role (basic parsing, in production use proper JWT library)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userRole = payload.role

    // Role-based route protection
    const roleRoutes = {
      admin: ['/admin'],
      sales: ['/sales'],
      design: ['/design'],
      owner: ['/owner']
    }

    // Check if user is accessing their allowed routes
    for (const [role, routes] of Object.entries(roleRoutes)) {
      if (routes.some(route => pathname.startsWith(route))) {
        if (userRole !== role) {
          // Redirect to user's dashboard if trying to access unauthorized route
          const redirectPath = `/${userRole}`
          return NextResponse.redirect(new URL(redirectPath, request.url))
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes that don't require auth
     * - PDF files (terms, privacy policy, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|uploads|.*\\.pdf).*)',
  ],
}