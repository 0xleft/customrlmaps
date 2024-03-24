import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
    name: z.string().max(20).optional(),
    versionString: z.string().regex(/^\d{1,4}\.\d{1,4}\.\d{1,4}$/, "Invalid version number format. Use x.x.x"),
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (req.headers.authorization === "CRLM_SECRET") {
        return res.status(403).json({ error: "Unauthorized" });
    }

	try {
		const parsed = schema.parse(JSON.parse(req.body));

        const version = await prisma.version.findFirst({
            where: {
                project: {
                    name: parsed.name,
                },
                version: parsed.versionString,
                deleted: false,
            }
        });

        if (!version) {
            return res.status(400).json({ error: "Version doesn't exists" });
        }

        return res.status(200).json({
            downloadUrl: version.downloadUrl,
        });
    } catch (e) {
		return res.status(400).json(process.env.NODE_ENV === "development" ? { error: e.message} : { error: "An error occurred"});
	}

	return res.status(500).json({ error: "An error occurred" });
}