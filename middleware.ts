import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('user');
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!currentUser && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (currentUser && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
