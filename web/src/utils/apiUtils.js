import { getAuth } from "@clerk/nextjs/server";
import { clerkClient, useClerk } from "@clerk/nextjs";
import { getUserRoles } from "@/utils/userUtils"
import prisma from "@/lib/prisma";

// server side
async function getAllUserInfo(req) {
    const user = getAuth(req);

    if (!user) {
        return null;
    }

    const dbUser = await prisma.user.findUnique({
        where: {
            clerkId: user.userId,
        }
    });

    if (!dbUser) {
        return null;
    }

    const clerkUser = await clerkClient.users.getUser(user.userId);

    const memberShips = await clerkClient.users.getOrganizationMembershipList({
        userId: user.userId,
    });

    const roles = memberShips.map((membership) => {
        return membership.organization.name;
    });

    return {
        dbUser,
        clerkUser,
        roles,
    }
}

export { getAllUserInfo }