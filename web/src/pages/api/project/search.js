import { z } from "zod";

const formSchema = z.object({
	query: z.string().max(100),
	page: z.number().int().min(0),
	username: z.string().max(100),
	order: z.enum(["createdAt", "likes", "views", "downloads"]),
	orderType: z.enum(["asc", "desc"]),
});

export default async function handler(req, res) {

    try {
        const params = new URL(req.url, "https://localhost").searchParams;
        const { query, page, username, order, orderType } = formSchema.parse({
            query: params.get("query") || "",
            page: parseInt(params.get("page")) || 0,
            username: params.get("username") || "",
            order: params.get("order") || "createdAt",
            orderType: params.get("orderType") || "desc",
        });
    
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { description: { contains: query } },
                    { user: { username: username } },
                ],
            },
            take: 10,
            skip: page * 10,
            orderBy: {
                [order]: orderType,
            },
            include: {
                user: true,
            },
        });
    
        return res.status(200).json({
            projects: projects.map((project) => ({
                name: project.name,
                description: project.description,
                likes: project.likes,
                views: project.views,
                downloads: project.downloads,
                user: project.user.username,
            })),
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}