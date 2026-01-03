import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "admin" | "editor" | "viewer";
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: "admin" | "editor" | "viewer";
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "editor" | "viewer";
  }
}
