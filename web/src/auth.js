import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getAllUserInfoServer } from './utils/userUtilsServer';
import prisma from './lib/prisma';

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
            try {
                if (account.provider === "google" && profile.email_verified === true) {

                    const user = prisma.user.findFirst({
                        where: {
                            email: profile.email,
                        }
                    });

                    if ((user.deleted || user.banned) && user.email !== process.env.ADMIN_EMAIL) {
                        return false;
                    }

                    // todo add the ip address to the users ips
                    await prisma.user.upsert({
                        where: {
                            email: profile.email,
                        },
                        update: {
                            lastLogin: new Date(),
                            ips: {
                                set: [...user.ips, ""], // todo add ip address
                            }
                        },
                        create: {
                            email: profile.email,
                            username: profile.email.split("@")[0],
                            fullname: "", // privacy
                            imageUrl: profile.picture,
                            roles: ["user", (profile.email === process.env.ADMIN_EMAIL ? "admin" : "")],
                        },
                    });

                    return true;
                }
            } catch (error) {
                console.error(error);
                return false;
            }

            return false;
        }
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)