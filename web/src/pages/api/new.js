import { getConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { verifyCaptcha } from '@/utils/captchaUtils';
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
	name: z.string().max(20).min(1, { message: "Name must not be empty" }).regex(/^[a-zA-Z0-9-_]+$/, { message: "Name must only contain letter characters" }),
	description: z.string().max(300).min(1, { message: "Description must not be empty" }),
	longDescription: z.string().max(2000).min(1, { message: "Long description must not be empty" }),
	type: z.enum(["mod", "map"]),
	gRecaptchatoken: z.string(),
})

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const appConfig = await getConfig();

	if (!appConfig.canCreateNewProjects && !isAdmin(user)) {
		return res.status(401).json({ error: "Creating new projects is currently disabled" });
	}

	try {
		const parsed = schema.parse(JSON.parse(req.body));

		if (await verifyCaptcha(parsed.gRecaptchatoken, "new") === false) {
			return res.status(400).json({ error: "Captcha failed" });
		}

		if (parsed.type === "mod" && !appConfig.canUploadMods && !isAdmin(user)) {
			return res.status(401).json({ error: "Creating mods is currently disabled" });
		}

		if (parsed.type === "map" && !appConfig.canUploadMaps && !isAdmin(user)) {
			return res.status(401).json({ error: "Creating maps is currently disabled" });
		}

		const exists = await prisma.project.findFirst({
			where: {
				name: parsed.name,
				type: parsed.type.toUpperCase(),
			}
		});
		
		if (exists) {
			return res.status(400).json({ error: "Already exists" });
		}

		// create presigned post
		const fileReturn = await createPresignedPost(client, {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: `projects/${parsed.name}/1.0.0.zip`,
			Conditions: [
				["content-length-range", 0, 300000000] // 300mb
			],
			Fields: {
				"Content-Type": "application/octet-stream",
			},
			Expires: 60,
		});

		const bannerReturn = await createPresignedPost(client, {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: `banners/${parsed.name}`,
			Conditions: [
				["content-length-range", 0, 10000000], // 10mb
				["starts-with", "$Content-Type", "image/"],
			],
			Fields: {
				"Content-Type": "image/png", 
			},
			Expires: 60,
		});

		// create the mod/map
		const project = await prisma.project.create({
			data: {
				name: parsed.name,
				description: parsed.description,
				longDescription: parsed.longDescription,
				type: parsed.type.toUpperCase(),
				userId: user.dbUser.id,
				imageUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/banners/${parsed.name}`,
				latestVersion: "1.0.0",
			},
		});

		// create the initial version
		await prisma.version.create({
			data: {
				projectId: project.id,
				version: "1.0.0",
				downloadUrl: `/api/project/download?p=${project.name}&v=1.0.0`,
				changes: "Initial version",
				downloadKey: `projects/${parsed.name}/1.0.0.zip`,
			},
		})

		return res.status(200).json({
			fileUrl: fileReturn.url,
			fileFields: fileReturn.fields,
			bannerUrl: bannerReturn.url,
			bannerFields: bannerReturn.fields,
		});
	} catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}