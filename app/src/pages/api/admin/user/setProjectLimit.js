import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { z } from 'zod';

const schema = z.object({
    name: z.string().optional(),
    limit: z.any().optional(),
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
        const { name, limit } = schema.parse(JSON.parse(req.body));

        const searchUser = await prisma.user.findFirst({
            where: {
                username: name,
            }
        });

        if (!searchUser) {
            return res.status(400).json({ error: "Project not found" });
        }

        await prisma.user.update({
            where: {
                username: name,
            },
            data: {
                projectLimit: parseInt(limit),
            }
        });

        return res.status(200).json({ message: "Success" });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}