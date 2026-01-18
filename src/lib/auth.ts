import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          const githubProfile = profile as any;
          
          // Check if user exists
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: user.email! },
                { accounts: { some: { providerAccountId: account.providerAccountId } } }
              ]
            },
            include: { accounts: true }
          });

          if (!dbUser) {
            // Create new user
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    token_type: account.token_type,
                    scope: account.scope,
                  }
                }
              },
              include: { accounts: true }
            });
          }

          // Create/update GitHub profile
          const ghProfile = await prisma.gitHubProfile.upsert({
            where: { username: githubProfile.login },
            create: {
              username: githubProfile.login,
              avatarUrl: githubProfile.avatar_url,
              bio: githubProfile.bio,
            },
            update: {
              avatarUrl: githubProfile.avatar_url,
              bio: githubProfile.bio,
            },
          });

          // Link user to GitHub profile
          if (dbUser) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { githubProfileId: ghProfile.id },
            });
          }

          return true;
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("SignIn error:", error);
          }
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Always fetch user data to ensure role is up to date
      if (token.email) {
        const dbUser = await prisma.user.findFirst({
          where: { email: token.email },
          include: { githubProfile: true }
        });
        
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.darkMode = dbUser.darkMode;
          token.username = dbUser.githubProfile?.username;
        }
      }
      
      // On initial sign-in, set username from GitHub profile
      if (account && profile) {
        const githubProfile = profile as any;
        if (!token.username) {
          token.username = githubProfile.login;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.darkMode = token.darkMode as boolean;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60, // 90 days (3 months)
  },
  pages: {
    signIn: "/auth/signin",
  },
};
