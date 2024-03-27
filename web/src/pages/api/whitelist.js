import { getConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { verifyCaptcha } from '@/utils/captchaUtils';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createHash } from 'crypto';
import { z } from 'zod';

const schema = z.object({
	otp: z.string(),
	gRecaptchatoken: z.string(),
})

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const parsed = schema.parse(JSON.parse(req.body));

		if (await verifyCaptcha(parsed.gRecaptchatoken, "whitelist") === false) {
			return res.status(400).json({ error: "Captcha failed" });
		}

        const whitelist = await prisma.whitelist.findFirst({
            where: {
                otp: parsed.otp,
            }
        });

        if (!whitelist) {
            return res.status(400).json({ error: "Invalid pin" });
        }

        return res.status(200).json({ success: true });
	} catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}