import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getAllUserInfoServer } from './utils/userUtilsServer';
import prisma from './lib/prisma';
import appConfig from './lib/config';

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

                    const dbUser = await prisma.user.findFirst({
                        where: {
                            email: profile.email,
                        }
                    });

                    if (!dbUser) {
                        if (!appConfig.isUserRegistrationEnabled) {
                            throw new Error("Registration is disabled");
                        }
                    }

                    if (dbUser && (dbUser.deleted || dbUser.banned) && dbUser.email !== process.env.ADMIN_EMAIL) {
                        throw new Error("User is banned or deleted");
                    }

                    if (dbUser.email !== process.env.ADMIN_EMAIL) {
                        if (!appConfig.isUserLoginEnabled) {
                            throw new Error("Login is disabled");
                        }
                    }

                    // todo add the ip address to the users ips
                    await prisma.user.upsert({
                        where: {
                            email: profile.email,
                        },
                        update: {
                            lastLogin: new Date(),
                            // todo ips
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