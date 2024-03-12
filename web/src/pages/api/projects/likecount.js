import { getAllUserInfo } from "@/utils/apiUtils";
import prisma from "@/lib/prisma";
import { z } from 'zod'

import { S3Client } from '@aws-sdk/client-s3'
import { createHash } from "crypto";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const schema = z.object({
	name: z.string().min(1, { message: "Name must not be empty" }).regex(/^[a-zA-Z0-9-_]+$/, { message: "Name must only contain letter characters" }),
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

        const project = await prisma.project.findFirst({
            where: {
                name: parsed.name,
            }
        });

        if (!exists) {
            return res.status(400).json({ error: "Does not exist" }); 
        }

        const likes = await prisma.like.count({
            where: {
                projectId: project.id,
            }
        });

        return res.status(200).json({ likes: likes });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}