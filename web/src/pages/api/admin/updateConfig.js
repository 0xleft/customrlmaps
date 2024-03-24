import appConfig, { AppConfig, updateConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { z } from 'zod';

const schema = z.object({
    isUserLoginEnabled: z.boolean(),
    isUserRegistrationEnabled: z.boolean(),
    canCreateNewProjects: z.boolean(),
    canUpdateProjects: z.boolean(),
    canDeleteProjects: z.boolean(),
    canRateProjects: z.boolean(),
    canUpdateProfile: z.boolean(),
    canDeleteProfile: z.boolean(),
    canSearchProjects: z.boolean(),
    canCreateVersions: z.boolean(),
    canDeleteVersions: z.boolean(),
    canSetLatestVersion: z.boolean(),
    adminOnly: z.boolean(),
    canUploadMods: z.boolean(),
    canUploadMaps: z.boolean(),
});

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
        const parsed = schema.parse(JSON.parse(req.body));
        await updateConfig(parsed);

        return res.status(200).json({ success: true });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}