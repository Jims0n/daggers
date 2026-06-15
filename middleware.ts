import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes — webhooks need unauthenticated access)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, images, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$).*)',
  ],
};