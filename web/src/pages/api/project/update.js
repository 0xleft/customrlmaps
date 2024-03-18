import prisma from "@/lib/prisma";
import { z } from 'zod'

import { S3Client } from '@aws-sdk/client-s3'
import { createHash } from "crypto";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getAllUserInfoServer } from "@/utils/userUtilsServer";

const client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const schema = z.object({
	name: z.any(),
	description: z.any(),
	longDescription: z.any(),
	status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
    banner: z.any().optional(),
})

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req);

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

        if (project.publishStatus === "DELETED") {
            return res.status(400).json({ error: "Project has been deleted" });
        }

        let updateData = {}
        if (parsed.description) {
            updateData.description = parsed.description;
        }
        if (parsed.longDescription) {
            updateData.longDescription = parsed.longDescription;
        }
        if (parsed.status) {
            updateData.publishStatus = parsed.status;
        }

        await prisma.project.update({
            where: {
                id: project.id,
            },
            data: updateData,
        });

        if (parsed.banner) {
            const currentTime = new Date().getTime();
            const bannername = createHash("sha256").update(parsed.name + `3641banner${currentTime}`).digest("hex");

            const bannerReturn = await createPresignedPost(client, {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `banners/${bannername}`,
                Conditions: [
                    ["content-length-range", 0, 10000000], // 10mb
                    ["starts-with", "$Content-Type", "image/"],
                ],
                Fields: {
                    acl: "public-read",
                    "Content-Type": "image/png", 
                },
                Expires: 60,
            });

            await prisma.project.update({
                where: {
                    id: project.id,
                },
                data: {
                    imageUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/banners/${bannername}`,
                }
            });

            return res.status(200).json({
                message: "Uploading banner...",
                bannerUrl: bannerReturn.url,
                bannerFields: bannerReturn.fields,
            });
        }

        return res.status(200).json({ message: "Updated" });
	} catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}