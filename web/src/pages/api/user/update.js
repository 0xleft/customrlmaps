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
	username: z.any(),
    description: z.any(),
    image: z.boolean(),
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

        if (user.dbUser.deleted) {
            return res.status(400).json({ error: "User has been deleted" });
        }

        let updateData = {}
        if (parsed.username && parsed.username !== user.dbUser.username) {
        // check if username is taken
            const exists = await prisma.user.findFirst({
                where: {
                    username: parsed.username,
                }
            });

            if (exists) {
                return res.status(400).json({ error: "Username is taken" });
            }

            updateData.username = parsed.username;
        }
        if (parsed.description) {
            updateData.description = parsed.description;
        }



        await prisma.user.update({
            where: {
                id: user.dbUser.id,
            },
            data: updateData,
        });

        if (parsed.image) {
            const currentTime = new Date().getTime();
            const imagename = createHash("sha256").update(parsed.username + `3641avatar${currentTime}`).digest("hex");

            const imageReturn = await createPresignedPost(client, {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `avatars/${imagename}`,
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

            await prisma.user.update({
                where: {
                    id: user.dbUser.id,
                },
                data: {
                    imageUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/avatars/${imagename}`,
                }
            });

            return res.status(200).json({
                message: "Uploading image...",
                url: imageReturn.url,
                fields: imageReturn.fields,
            });
        }

        return res.status(200).json({ message: "Updated" });
	} catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}