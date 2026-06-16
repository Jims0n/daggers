import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db, users, accounts, sessions, verificationTokens, carts } from '@/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt-ts-edge';
import { authConfig } from './auth.config';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

export const config = {
  trustHost: true,
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));

        if (user && user.password) {
          const isMatch = await compare(credentials.password as string, user.password);

          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          await db
            .update(users)
            .set({ name: token.name })
            .where(eq(users.id, user.id));
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const [sessionCart] = await db
              .select()
              .from(carts)
              .where(eq(carts.sessionCartId, sessionCartId));

            if (sessionCart) {
              await db.delete(carts).where(eq(carts.userId, user.id));

              await db
                .update(carts)
                .set({ userId: user.id })
                .where(eq(carts.id, sessionCart.id));
            }
          }
        }
      }

      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
