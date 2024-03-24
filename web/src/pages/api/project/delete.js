import appConfig from '@/lib/config';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { z } from 'zod';

const schema = z.object({
	name: z.string().max(20),
})

export default async function handler(req, res) {
    if (!appConfig.canDeleteProjects) {
        return res.status(403).json({ error: "Deleting projects is disabled" });
    }

	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const parsed = schema.parse(JSON.parse(req.body));

        const project = await prisma.project.findUnique({
            where: {
                name: parsed.name,
            }
        });

        if (!project) {
            return res.status(400).json({ error: "Project not found" });
        }

        if ((project.userId !== user.dbUser.id) && !isAdmin(user)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.project.update({
            where: {
                name: parsed.name,
            },
            data: {
                deletedAt: new Date(),
                deleted: true,
            }
        });

        await prisma.version.updateMany({
            where: {
                projectId: project.id,
            },
            data: {
                deletedAt: new Date(),
                deleted: true,
            }
        });

        return res.status(200).json({ message: "Deleted" });
	} catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}