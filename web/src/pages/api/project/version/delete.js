import { getConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { z } from 'zod';

const schema = z.object({
    name: z.string().max(20).optional(),
    versionString: z.string().regex(/^\d{1,4}\.\d{1,4}\.\d{1,4}$/, "Invalid version number format. Use x.x.x"),
});

export default async function handler(req, res) {
    const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    if (!(await getConfig()).canDeleteVersions && !isAdmin(user)) {
        return res.status(403).json({ error: "Deleting versions is disabled" });
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

        if (project.deleted) {
            return res.status(400).json({ error: "Project has been deleted" });
        }

        const version = await prisma.version.findFirst({
            where: {
                projectId: project.id,
                version: parsed.versionString,
                deleted: false,
            }
        });

        if (!version) {
            return res.status(400).json({ error: "Version doesn't exists" });
        }

        if (project.latestVersion === version.version) {
            return res.status(400).json({ error: "Cannot delete the latest version" });
        }

        await prisma.version.update({
            where: {
                id: version.id,
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