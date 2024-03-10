import { Inter } from "next/font/google";
import prisma from "@/lib/prisma";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient, useClerk } from "@clerk/nextjs";
import { getUserRoles } from "@/utils/userUtils";

const inter = Inter({ subsets: ["latin"] });

// this is so we can sync the user with the clerk user and the db user

export const getServerSideProps = async ({ req, res }) => {
    const user = getAuth(req);

    const dbUser = await prisma.user.findUnique({
        where: {
            clerkId: user.userId,
        }
    });

    const clerkUser = await clerkClient.users.getUser(user.userId);

    const memberShips = await clerkClient.users.getOrganizationMembershipList({
        userId: user.userId,
    });

    const roles = memberShips.map((membership) => {
        return membership.organization.name;
    });

    await prisma.user.upsert({
        where: {
            clerkId: user.userId,
        },
        create: {
            username: clerkUser.firstName + clerkUser.lastName,
            clerkId: user.userId,
            // decite if this is really the primary // todo
            email: clerkUser.emailAddresses[0].emailAddress,
            imageUrl: clerkUser.imageUrl,
            roles: {
                set: roles,
            }
        },
        update: {
            roles: {
                set: roles,
            }
        }
    });

    return {
        props: {
        },
    };
}

export default function AfterLog({ user }) {
    const router = useRouter();

    useEffect(() => {
        router.push('/');
    }, []);

    return (
        <>
            <h1>Loading...</h1>
        </>
    );
}