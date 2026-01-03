import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

type DemoUser = {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  name: string;
};

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
        if (credentials.email.toLowerCase() === demoUser.toLowerCase() && credentials.password === demoPassword) {
          return {
            id: "demo-admin",
            email: credentials.email,
            role: "admin",
            name: "Demo Admin",
          } satisfies DemoUser;
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
          role: (token as { role?: DemoUser["role"] }).role ?? "viewer",
          name: session.user?.name ?? "",
        } as DemoUser;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && (user as DemoUser).role) token.role = (user as DemoUser).role;
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
