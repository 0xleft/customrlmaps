import { getAllUserInfoServer } from '@/utils/userUtilsServer';

export default async function handler(req, res) {
	const user = await getAllUserInfoServer(req, res);

	if (!user.session || !user.dbUser) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

    res.status(200).json({ imageUrl: user.dbUser.imageUrl });
}