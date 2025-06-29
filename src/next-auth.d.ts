


declare module "next-auth" {
  interface Session {
    accessToken?: string
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
    }
  }

  interface User {
    username?: string | null
  }
}
