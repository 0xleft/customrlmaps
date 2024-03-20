import { z } from "zod";

const formSchema = z.object({
	query: z.string().max(100),
	page: z.number().int().min(0),
	username: z.string().max(100),
	order: z.enum(["createdAt", "likes", "views", "downloads"]),
	orderType: z.enum(["asc", "desc"]),
    rating: z.number().int().min(0).max(5),
});

export default async function handler(req, res) {

    try {
        const params = new URL(req.url, "https://localhost").searchParams;

        const { query, page, username, order, orderType, rating } = formSchema.parse({
            query: params.get("query") || "",
            page: parseInt(params.get("page")) || 0,
            username: params.get("username") || "",
            order: params.get("order") || "views",
            orderType: params.get("orderType") || "desc",
            rating: parseInt(params.get("rating")) || 0,
        });
    
        const projectsQuery = {
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        averageRating: {
                            gte: rating,
                        },
                    },
                ],
                deleted: false,
                publishStatus: {
                    equals: "PUBLISHED",
                },
            },
            take: 10,
            skip: page * 10,
            orderBy: {
                [order]: orderType,
            },
            include: {
                user: true,
            },
        };

        const projects = await prisma.project.findMany(projectsQuery);
    
        return res.status(200).json({
            projects: projects.map((project) => ({
                name: project.name,
                description: project.description,
                rating: project.averageRating,
                views: project.views,
                downloads: project.downloads,
                user: project.user.username,
                imageUrl: project.imageUrl,
                isRated: project.totalRatings > 0,
            })),
        });
    } catch (error) {
        return res.status(400).json({ error: process.env.NODE_ENV === "development" ? error.message : "Invalid request" });
    }
}