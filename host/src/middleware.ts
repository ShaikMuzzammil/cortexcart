import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth   = req.cookies.get('host_auth')
  const secret = process.env.HOST_SECRET || 'cx-host-secret'
  if (req.nextUrl.pathname.startsWith('/dashboard') && auth?.value !== secret) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}
export const config = { matcher: ['/dashboard/:path*'] }
