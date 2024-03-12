import { Inter } from "next/font/google";
import prisma from "@/lib/prisma";
import CustomError from "@/components/CustomError";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { getAllUserInfo } from "@/utils/apiUtils";
import { ItemCard } from "@/components/ItemCard";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
  } from "@/components/ui/pagination"
  

const inter = Inter({ subsets: ["latin"] });

const PER_PAGE = 10

export const getServerSideProps = async ({ req, res, params }) => {
	res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

	try {
		const currentUser = getAllUserInfo(req);
		const { username } = params;
	
		const dbUser = await prisma.user.findUnique({
			where: {
				username: username,
			}
		});
	
		if (!dbUser) {
			return {
				props: {
					notFound: true,
				},
			};
		}
	
		const page = parseInt(new URL(req.url, "https://localhost").searchParams.get('page')) || 1;
	
		const projects = await prisma.project.findMany(
			{
				where: {
					userId: dbUser.id,
					// publishStatus: (currentUser && currentUser.id === dbUser.id) ? undefined : "PUBLISHED",
				},
				take: PER_PAGE,
				skip: (page - 1) * PER_PAGE,
				orderBy: {
					createdAt: "desc",
				},
			}
		);
	
		const maxPage = await prisma.project.count({
			where: {
				userId: dbUser.id,
				// publishStatus: (currentUser && currentUser.id === dbUser.id) ? undefined : "PUBLISHED",
			},
		});
	
	
		return {
			props: {
				user: {
					username: dbUser.username,
				},
				projects: projects.map((project) => {
					return {
						name: project.name,
						description: project.description,
						imageUrl: project.imageUrl,
						createdAt: `${project.createdAt.getDate()}/${project.createdAt.getMonth()}/${project.createdAt.getFullYear()}`,
					};
				}),
				currentPage: page,
				maxPage: Math.ceil(maxPage / PER_PAGE),
			},
		};
	} catch (e) {
		return {
			props: {
				notFound: true,
			},
		};
	}
};

export default function projects({ user, projects, notFound, currentPage, maxPage }) {

	if (notFound) {
		return (
			<CustomError error="404">
				<p>User not found</p>
			</CustomError>
		);
	}

	return (
		<>
            <div className="container p-4 min-h-screen">
                <Card className="w-full h-full min-h-screen">
                    <CardHeader className="flex flex-col">
                        <CardTitle>
							{user.username}'s projects
                        </CardTitle>
					</CardHeader>

					<CardContent className="h-full">
						{projects.map((project) => {
							return (
								<div key={project.name} className="mb-4">
									<ItemCard title={project.name} description={project.description} image={project.imageUrl} createdAt={project.createdAt} />
								</div>
							);
						})}
					</CardContent>

					<CardFooter>
						<Pagination>
							<PaginationContent>
								<PaginationItem>
								<PaginationPrevious href={currentPage === 1 ? "#" : `/user/${user.username}/projects?page=${currentPage - 1}`} />
								</PaginationItem>
								<PaginationItem>
								<PaginationLink href="#" aria-current="page">
									{currentPage}
								</PaginationLink>
								</PaginationItem>
								<PaginationItem>
								<PaginationEllipsis />
								</PaginationItem>
								<PaginationItem>
								<PaginationNext href={currentPage === maxPage ? "#" : `/user/${user.username}/projects?page=${currentPage + 1}`} />
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}