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
    name: z.any(),
    changes: z.string().min(1, {
        message: "Changes are required",
    }),
    versionString: z.string().regex(/^\d{1,4}\.\d{1,4}\.\d{1,4}$/, "Invalid version number format. Use x.x.x"),
    latest: z.boolean(),
});

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

        if (project.publishStatus === "DELETED") {
            return res.status(400).json({ error: "Project has been deleted" });
        }

        const projectType = project.type.toLowerCase();

        const exists = await prisma.version.findFirst({
            where: {
                projectId: project.id,
                version: parsed.versionString,
            }
        });

        if (exists) {
            return res.status(400).json({ error: "Version already exists" });
        }

        if (parsed.latest === true) {
            await prisma.project.update({
                where: {
                    id: project.id,
                },
                data: {
                    latestVersion: parsed.versionString,
                }
            });
        }

        const filename = createHash("sha256").update(parsed.name + `3641file${new Date().getTime()}`).digest("hex");

        await prisma.version.create({
            data: {
                projectId: project.id,
                changes: parsed.changes,
                version: parsed.versionString,
                downloadUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${projectType}s/${filename}`,
            }
        });
        
        const fileReturn = await createPresignedPost(client, {
			Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${projectType}s/${filename}`,
            Conditions: [
				["content-length-range", 0, 100000000] // 100mb
			],
			Fields: {
				acl: "public-read",
			},
			Expires: 60,
		});

        return res.status(200).json({
            message: "Created",
            url: fileReturn.url,
            fields: fileReturn.fields,
        });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}