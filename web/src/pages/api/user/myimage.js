import prisma from '@/lib/prisma';
import { getAllUserInfoServer } from '@/utils/userUtilsServer';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createHash } from 'crypto';
import { z } from 'zod';

export default async function handler(req, res) {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=31536000, stale-while-revalidate=60'
    )

	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    res.status(200).json({ imageUrl: user.dbUser.imageUrl });
}