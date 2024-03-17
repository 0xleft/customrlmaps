import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const config = {
    theme: {
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)