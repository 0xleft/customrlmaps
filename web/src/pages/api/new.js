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
	name: z.string().min(1, { message: "Name must not be empty" }).regex(/^[a-zA-Z0-9-_]+$/, { message: "Name must only contain letter characters" }).
	refine((file) => file !== "projects", { error: "Bad filename" }),
	description: z.string().min(1, { message: "Description must not be empty" }).regex(/^[a-zA-Z0-9-_]+$/, { message: "Description must only contain letter characters" }),
	longDescription: z.string().min(1, { message: "Long description must not be empty" }),
	type: z.enum(["mod", "map"]),
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

		
		
		const exists = await prisma.project.findFirst({
			where: {
				name: parsed.name,
				type: parsed.type.toUpperCase(),
			}
		});
		
		if (exists) {
			return res.status(400).json({ error: "Already exists" });
		}

		const currentTime = new Date().getTime();

		const filename = createHash("sha256").update(parsed.name + `3641file${currentTime}`).digest("hex");
		const bannername = createHash("sha256").update(parsed.name + `3641banner${currentTime}`).digest("hex");

		// create presigned post
		const fileReturn = await createPresignedPost(client, {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: `${parsed.type}s/${filename}`,
			Conditions: [
				["content-length-range", 0, 100000000] // 100mb
			],
			Fields: {
				acl: "public-read",
				"Content-Type": parsed.type === "mod" ? "application/x-msdownload" : "application/octet-stream",
			},
			Expires: 60,
		});

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

		// create the mod/map
		const project = await prisma.project.create({
			data: {
				name: parsed.name,
				description: parsed.description,
				longDescription: parsed.longDescription,
				type: parsed.type.toUpperCase(),
				userId: user.dbUser.id,
				imageUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/banners/${bannername}`,
			},
		});

		// create the initial version
		await prisma.version.create({
			data: {
				project: {
					connect: {
						id: project.id,
					},
				},
				projectId: project.id,
				isLatest: true,
				version: "1.0.0",
				downloadUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${parsed.type}s/${filename}`,
				changes: "Initial version",
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