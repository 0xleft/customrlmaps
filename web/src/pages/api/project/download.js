import { getConfig } from "@/lib/config";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const formSchema = z.object({
	p: z.string().max(100).optional(),
    v: z.string().max(100).optional(),
});

export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const bypass = req.headers["x-local-host-bypass"] === "true";
    
    if (!bypass) {
        if (!(await getConfig()).canDownload) {
            return res.status(403).json({ error: "Downloading objects is disabled" });
        }
    }

    try {
        const params = new URL(req.url, "https://localhost").searchParams;

        const { p, v } = formSchema.parse({
            p: params.get("p") || undefined,
            v: params.get("v") || undefined,
        });

        const project = await prisma.project.findUnique({
            where: {
                name: p,
                deleted: false,
                publishStatus: bypass ? undefined : "PUBLISHED",
            }
        });

        if (!project) {
            return res.status(400).json({ error: "Project not found or not public" });
        }

        const version = await prisma.version.findFirst({
            where: {
                projectId: project.id,
                version: v,
                checkedStatus: bypass ? undefined : "APPROVED",
                deleted: false,
            }
        });

        if (!version) {
            return res.status(400).json({ error: "Version not found or not public" });
        }

        // create presigned urk
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `projects/${project.name}/${version.version}.zip`,
        });

        const url = await getSignedUrl(client, command, { expiresIn: 5 * 60 });

        return res.status(200).json({
            downloadUrl: url,
        });

    } catch (error) {
        return res.status(400).json({ error: process.env.NODE_ENV === "development" ? error.message : "Invalid request" });
    }
}