import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { z } from 'zod';

const schema = z.object({
    id: z.number().optional(),
    banned: z.boolean().optional(),
});

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    if (!isAdmin(user)) {
        return res.status(403).json({ error: "Forbidden" });
    }

	try {
        const { id, banned } = schema.parse(req.body);

        if (!id) {
            return res.status(400).json({ error: "Missing id" });
        }

        const dbUser = await prisma.user.findFirst({
            where: {
                id: id,
            }
        });

        const projects = await prisma.project.findMany({
            where: {
                userId: dbUser.id,
            }
        });

        projects.forEach(async (project) => {
            await prisma.version.updateMany({
                where: {
                    projectId: project.id,
                },
                data: {
                    deleted: banned,
                    deletedAt: banned ? new Date() : null,
                }
            });
        });

        await prisma.project.updateMany({
            where: {
                userId: dbUser.id,
            },
            data: {
                deleted: banned,
                deletedAt: banned ? new Date() : null,
            },
        });

        await prisma.user.update({
            where: {
                id: dbUser.id,
            },
            data: {
                banned: banned,
                bannedAt: banned ? new Date() : null,
            }
        });

        return res.status(200).json({ message: "Deleted" });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}