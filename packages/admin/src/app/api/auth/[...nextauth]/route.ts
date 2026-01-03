import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials, { type CredentialInput } from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const demoUser = process.env.NEOBUILDER_DEMO_USER ?? "admin@neobuilder.local";
        const demoPassword = process.env.NEOBUILDER_DEMO_PASSWORD ?? "changeme";
        if (
          credentials.email.toLowerCase() === demoUser.toLowerCase() &&
          credentials.password === demoPassword
        ) {
          return {
            id: "demo-admin",
            email: credentials.email,
            role: "admin",
            name: "Demo Admin",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user = {
          id: token.sub,
          email: session.user?.email ?? "",
          role: (token as { role?: string }).role ?? "viewer",
          name: session.user?.name ?? "",
        } as typeof session.user & { id: string; role: string };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
