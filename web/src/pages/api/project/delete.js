import { getAllUserInfo } from "@/utils/apiUtils";
import prisma from "@/lib/prisma";
import { z } from 'zod'

import { S3Client } from '@aws-sdk/client-s3'
import { createHash } from "crypto";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const schema = z.object({
	name: z.any(),
})

export default async function handler(req, res) {
	const user = await getAllUserInfo(req);

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

        if (project.userId !== user.dbUser.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.project.update({
            where: {
                name: parsed.name,
            },
            data: {
                deletedAt: new Date(),
                publishStatus: "DELETED",
            }
        });

        return res.status(200).json({ message: "Deleted" });
	} catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}