import { getConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { z } from 'zod';

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    if (!(await getConfig()).canDeleteProfile && !isAdmin(user)) {
        return res.status(403).json({ error: "Deleting profiles is disabled" });
    }

	try {
        if (user.dbUser.deleted) {
            return res.status(400).json({ error: "User has been deleted" });
        }

        await prisma.project.updateMany({
            where: {
                userId: user.dbUser.id,
            },
            data: {
                publishStatus: "DRAFT"
            },
        });

        await prisma.user.update({
            where: {
                id: user.dbUser.id,
            },
            data: {
                deleted: true,
                deletedAt: new Date(),
            }
        });

        return res.status(200).json({ message: "Deleted" });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}