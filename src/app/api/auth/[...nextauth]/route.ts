
import NextAuth, { AuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { loadServerConfig } from "@/lib/serverConfig"

const serverConfig = loadServerConfig()

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: (process.env.GITHUB_ID || serverConfig.githubId) as string,
      clientSecret: (process.env.GITHUB_SECRET || serverConfig.githubSecret) as string,
      authorization: {
        params: { scope: "repo" },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login, // Add the GitHub login (username) here
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.username = (user as { login: string }).login
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.username = token.username as string | null | undefined
      }
      session.accessToken = token.accessToken
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
