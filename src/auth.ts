import NextAuth from "next-auth"
import spotify from "next-auth/providers/spotify"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [spotify],
})