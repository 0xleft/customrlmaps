import prisma from '@/lib/prisma';
import { getAllUserInfoServer } from '@/utils/userUtilsServer';
import { z } from 'zod';

const schema = z.object({
    username: z.string().max(20),
});

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
        if (user.dbUser.deleted) {
            return res.status(400).json({ error: "User has been deleted" });
        }

        const projects = prisma.project.findMany({
            where: {
                userId: user.dbUser.id,
            }
        });

        for (const project of projects) {
            await prisma.version.updateMany({
                where: {
                    projectId: project.id,
                },
                data: {
                    deleted: true,
                    deletedAt: new Date(),
                }
            });
        }

        await prisma.project.updateMany({
            where: {
                userId: user.dbUser.id,
            },
            data: {
                deleted: true,
                deletedAt: new Date(),
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