import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/auth/login', error: '/auth/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const { prisma } = await import('@/lib/prisma')
          const bcrypt    = await import('bcryptjs')
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user || !user.password) return null
          const valid = await bcrypt.compare(credentials.password, user.password)
          if (!valid) return null
          return { id: user.id, email: user.email, name: user.name, role: user.role } as any
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role }
      if (trigger === 'update' && session?.name) token.name = session.name
      return token
    },
    async session({ session, token }) {
      if (token) { (session.user as any).id = token.id; (session.user as any).role = token.role }
      return session
    },
  },
}
