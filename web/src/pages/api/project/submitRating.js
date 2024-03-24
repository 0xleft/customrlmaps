import appConfig from '@/lib/config';
import prisma from '@/lib/prisma';
import { verifyCaptcha } from '@/utils/captchaUtils';
import { getAllUserInfoServer } from '@/utils/userUtilsServer';
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
	rating: z.number().min(0).max(5),
    projectId: z.number(),
    gRecaptchatoken: z.string(),
});

export default async function handler(req, res) {
    if (!appConfig.canRateProjects) {
        return res.status(403).json({ error: "Rating projects is disabled" });
    }

	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const parsed = schema.parse(JSON.parse(req.body));

        if (await verifyCaptcha(parsed.gRecaptchatoken, "submitRating") === false) {
            return res.status(400).json({ error: "Captcha failed" });
        }

        const project = await prisma.project.findUnique({
            where: {
                id: parsed.projectId,
            }
        });

        if (!project) {
            return res.status(400).json({ error: "Project not found" });
        }

        if (project.deleted) {
            return res.status(400).json({ error: "Project has been deleted" });
        }

        const rating = await prisma.rating.findFirst({
            where: {
                projectId: parsed.projectId,
                userId: user.dbUser.id,
            }
        });

        if (rating) {
            return res.status(400).json({ error: "Rating already submitted" });
        }
        
        await prisma.project.update({
            where: {
                id: parsed.projectId,
            },
            data: {
                totalRatings: {
                    increment: 1,
                },
                ratingSum: {
                    increment: parsed.rating,
                },
                averageRating: {
                    set: (project.ratingSum + parsed.rating) / (project.totalRatings + 1),
                }
            }
        });

        await prisma.rating.create({
            data: {
                rating: parsed.rating,
                projectId: parsed.projectId,
                userId: user.dbUser.id,
            }
        });

        return res.status(200).json({ message: "Submited" });
	} catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}