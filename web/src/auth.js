import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const config = {
    theme: {
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
    },
    callbacks: {
        async signIn({ user, account, profile}) {
            if (account.provider === "google" && profile.email_verified === true) {
                await prisma.user.upsert({
                    where: {
                        email: user.email,
                    },
                    update: {

                    },
                    create: {
                        email: profile.email,
                        username: profile.email.split("@")[0],
                        fullname: profile.name,
                        imageUrl: profile.picture,
                    },
                });

                return true;
            }

            return false;
        }
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)