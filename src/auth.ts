import NextAuth from "next-auth";
import spotify from "next-auth/providers/spotify"; 

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    spotify({
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-read-private,playlist-modify-private,playlist-modify-public",
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        token,
      };
    },
  },
});
