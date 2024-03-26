import { getConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createHash } from 'crypto';
import { z } from 'zod';

const client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const schema = z.object({
    name: z.string().max(20).regex(/^[a-zA-Z0-9-_]+$/, { message: "Name must only contain letter characters" }).optional(),
    changes: z.string().min(1, {
        message: "Changes are required",
    }).max(300),
    versionString: z.string().regex(/^\d{1,4}\.\d{1,4}\.\d{1,4}$/, "Invalid version number format. Use x.x.x"),
    latest: z.boolean(),
});

export default async function handler(req, res) {
    const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    if (!(await getConfig()).canCreateVersions && !isAdmin(user)) {
        return res.status(403).json({ error: "Creating versions is disabled" });
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

        const fileReturn = await createPresignedPost(client, {
			Bucket: process.env.AWS_BUCKET_NAME,
            Key: `projects/${parsed.name}/${parsed.versionString}.zip`,
            Conditions: [
				["content-length-range", 0, 300000000] // 300mb
            ],
            Fields: {
            },
            Expires: 60,
        });

        await prisma.version.create({
            data: {
                projectId: project.id,
                changes: parsed.changes,
                version: parsed.versionString,
                downloadUrl: `/api/project/download?p=${project.name}&v=${parsed.versionString}`,
                downloadKey: `projects/${parsed.name}/${parsed.versionString}.zip`,
            }
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