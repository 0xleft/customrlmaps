import NextAuth from 'next-auth/next';
import Google from 'next-auth/providers/google';
import { getAllUserInfoServer } from '@/utils/userUtilsServer';
import prisma from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import Credentials from 'next-auth/providers/credentials';

export default (req, res) => NextAuth(req, res, {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error",
    },

    callbacks: {
        async signIn({ user, account, profile}) {
            try {
                if (account.provider === "google") {

                    if (profile.email_verified === false) {
                        throw new Error("Email not verified");
                    }

                    const dbUser = await prisma.user.findFirst({
                        where: {
                            email: profile.email,
                        }
                    });

                    const appConfig = await getConfig();

                    if (profile.email !== process.env.ADMIN_EMAIL) {
                        if (!appConfig.isUserLoginEnabled) {
                            throw new Error("Login is disabled");
                        }
                    }

                    if (!dbUser) {
                        const whitelist = await prisma.whitelist.findFirst({
                            where: {
                                otp: req.cookies.whitelist,
                            }
                        });

                        if (!appConfig.isUserRegistrationEnabled && !whitelist) {
                            throw new Error("Registration is disabled");
                        }

                        // delete as it has one time use
                        if (whitelist) {
                            await prisma.whitelist.delete({
                                where: {
                                    otp: req.cookies.whitelist,
                                }
                            });
                        }

                        // clear the cookie
                        res.setHeader("Set-Cookie", "whitelist=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict; Secure");
                    }

                    if (dbUser && (dbUser.deleted || dbUser.banned) && profile.email !== process.env.ADMIN_EMAIL) {
                        throw new Error("User is banned or deleted");
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
                            roles: ["user", (profile.email === process.env.ADMIN_EMAIL ? "admin" : "")],
                        },
                    });

                    return true;
                }
            } catch (error) {
                if (error.message === "Registration is disabled") {
                    throw new Error("Registration is disabled");
                }
                if (error.message === "Login is disabled") {
                    throw new Error("Login is disabled");
                }
                if (error.message === "User is banned or deleted") {
                    throw new Error("User is banned or deleted");
                }
                if (error.message === "Email not verified") {
                    throw new Error("Email not verified");
                }
                return false;
            }

            return false;
        }
    }
});