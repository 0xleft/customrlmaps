import appConfig, { AppConfig, updateConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { z } from 'zod';

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req, res);

	if (!user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    if (!isAdmin(user)) {
        return res.status(403).json({ error: "Forbidden" });
    }

	try {
        // generate random 6 digit number
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.whitelist.create({
            data: {
                otp,
            }
        });

        return res.status(200).json({ otp });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}