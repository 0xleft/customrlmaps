import { Inter } from "next/font/google";
import prisma from "@/lib/prisma";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient, useClerk } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

// this is so we can sync the user with the clerk user and the db user

export const getServerSideProps = async ({ req, res }) => {
    const user = getAuth(req, { withGuards: true });

    const dbUser = await prisma.user.findUnique({
        where: {
            clerkId: user.userId,
        }
    });

    const clerkUser = await clerkClient.users.getUser(user.userId);

    if (!dbUser) {
        prisma.user.create({
            data: {
                username: clerkUser.username,
                clerkId: user.userId,
                // decite if this is really the primary // todo
                email: clerkUser.emailAddresses[0].emailAddress,
            }
        })
    }

    return {
    props: {},
  };
}

export default function AfterLog({ user }) {
    const router = useRouter();

    useEffect(() => {
        router.push('/maps');
    }, []);

    return (
        <>
        </>
    );
}