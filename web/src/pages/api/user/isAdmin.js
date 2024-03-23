import { getAllUserInfoServer } from '@/utils/userUtilsServer';

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req, res);

	if (!user.session || !user.dbUser) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    return res.status(401).json({ isAdmin: user.dbUser.roles.includes("admin") });
}