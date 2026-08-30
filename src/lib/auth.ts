import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";
import { ROLES } from "./constants";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatarUrl,
        };
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Credentials users already exist in the DB by the time authorize()
      // returns them. Google (or any future OAuth provider) users are
      // provisioned here on first login, always as STUDENT — an admin
      // promotes them to INSTRUCTOR/ADMIN afterwards from /admin/usuarios.
      if (account?.provider !== "credentials" && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name || undefined,
            avatarUrl: user.image || undefined,
          },
          create: {
            email: user.email,
            name: user.name || user.email,
            avatarUrl: user.image,
            passwordHash: null,
            role: ROLES.STUDENT,
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // Runs only on sign-in (when `user` is populated). Re-reading from
      // the DB by email keeps role/id authoritative for every provider,
      // including one just upserted above for a fresh Google sign-in.
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
});
