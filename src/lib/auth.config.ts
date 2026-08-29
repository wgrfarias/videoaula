import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Credentials provider / Prisma here so this file can be
// imported from middleware (which runs on the Edge runtime).
export const authConfig = {
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      const isStudentArea = pathname.startsWith("/aluno");
      const isInstructorArea = pathname.startsWith("/professor");
      const isAdminArea = pathname.startsWith("/admin");

      if (isStudentArea) {
        return isLoggedIn;
      }

      if (isInstructorArea) {
        return isLoggedIn && (role === "INSTRUCTOR" || role === "ADMIN");
      }

      if (isAdminArea) {
        return isLoggedIn && role === "ADMIN";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
