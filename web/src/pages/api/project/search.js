import { getConfig } from "@/lib/config";
import prisma from "@/lib/prisma";
import { z } from "zod";

const formSchema = z.object({
	query: z.string().max(100).optional(),
	page: z.number().int().min(0),
	username: z.string().max(100).optional(),
	order: z.enum(["createdAt", "likes", "views", "downloads", "averageRating", "updatedAt"]),
	orderType: z.enum(["asc", "desc"]),
    rating: z.number().min(0).max(5),
    type: z.enum(["map", "mod"]).optional()
});

export default async function handler(req, res) {

    if (!(await getConfig()).canSearchProjects) {
        return res.status(403).json({ error: "Searching projects is disabled" });
    }
    
    try {
        const params = new URL(req.url, "https://localhost").searchParams;

        const { query, page, username, order, orderType, rating, type } = formSchema.parse({
            query: params.get("query") || undefined,
            page: parseInt(params.get("page")) || 0,
            username: params.get("username") || undefined,
            order: params.get("order") || "views",
            orderType: params.get("orderType") || "desc",
            rating: parseFloat(params.get("rating")) || 0,
            type: params.get("type") || undefined,
        });

        const projects = await prisma.project.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
                description: {
                    contains: query,
                    mode: "insensitive",
                },
                user: {
                    username: {
                        contains: username,
                        mode: "insensitive",
                    },
                },
                type: type ? type.toUpperCase() : undefined,
                averageRating: {
                    gte: rating,
                },
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
        });
    
        return res.status(200).json({
            projects: projects.map((project) => ({
                type: project.type,
                name: project.name,
                description: project.description,
                rating: project.averageRating,
                views: project.views,
                downloads: project.downloads,
                user: project.user.username,
                imageUrl: project.imageUrl,
                isRated: project.totalRatings > 0,
                averageRating: project.averageRating,
                latestVersion: project.latestVersion,
                updated: `${project.updatedAt.getDate()}/${project.updatedAt.getMonth()}/${project.updatedAt.getFullYear()}`,
            })),
        });
    } catch (error) {
        return res.status(400).json({ error: process.env.NODE_ENV === "development" ? error.message : "Invalid request" });
    }
}