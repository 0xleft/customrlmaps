import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { ItemCard } from '@/components/ItemCard';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import UserLeftCom from '@/components/UserLeftCom';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';

const PER_PAGE = 10

export const getServerSideProps = async ({ req, res, params }) => {
	try {
		const currentUser = await getAllUserInfoServer(req, res);
		const { username } = params;
	
		const dbUser = await prisma.user.findUnique({
			where: {
				username: username,
			}
		});
	
		if (!dbUser || dbUser.deleted) {
			return {
				notFound: true,
			};
		}

		// todo
		const page = parseInt(new URL(req.url, "https://localhost").searchParams.get('page')) || 1;
	
		let projectQuery = {
			where: {
				userId: dbUser.id,
				deleted: false,
			},
			take: PER_PAGE,
			skip: (page - 1) * PER_PAGE,
			orderBy: {
				createdAt: "desc",
			},
		};

    	if (!currentUser || (currentUser?.dbUser?.id !== dbUser.id && !isAdmin(currentUser))) {
			projectQuery.where.publishStatus = "PUBLISHED";
		}

		const projects = await prisma.project.findMany(
			projectQuery
		);
	
		const maxPage = await prisma.project.count({
			where: {
				userId: dbUser.id,
			},
		});
	
	
		return {
			props: {
				user: {
					username: dbUser.username,
					imageUrl: dbUser.imageUrl,
					roles: dbUser.roles,
					description: dbUser.description,
					created: `${dbUser.createdAt.getDate()}/${dbUser.createdAt.getMonth()}/${dbUser.createdAt.getFullYear()}`,
					isOwner: dbUser.id === currentUser.dbUser.id
				},
				projects: projects.map((project) => {
					return {
						name: project.name,
						description: project.description,
						imageUrl: project.imageUrl,
						createdAt: `${project.createdAt.getDate()}/${project.createdAt.getMonth()}/${project.createdAt.getFullYear()}`,
						type: project.type,
						status: project.publishStatus,
					};
				}),
				currentPage: page,
				maxPage: Math.ceil(maxPage / PER_PAGE),
			},
		};
	} catch (e) {
		return {
			notFound: true,
		};
	}
};

export default function projects({ user, projects, currentPage, maxPage }) {
	return (
		<>
			<div className='flex flex-row justify-center p-4 min-h-screen'>
                <div className='hidden lg:flex lg:w-[20%] p-2'>
                    <UserLeftCom user={user} />
                </div>

                <div className="w-full p-2 lg:w-[66%] min-h-screen">
					<Card className="w-full h-full min-h-screen">
						<CardHeader className="flex-col flex lg:hidden">
							<CardTitle>
								<div className='flex flex-row items-center space-x-2'>
									<Avatar>
										<AvatarImage src={user.imageUrl} alt={user.username} />
									</Avatar>
									<div>
										{user.username}
									</div>
									{user.roles.map((role) => {
										return (
											<Badge key={role} className="ml-2">{role}</Badge>
										);
									})}
								</div>
							</CardTitle>

							<DateComponent text={`Joined ${user.created}`} />

							<CardDescription className={user.description ? "" : "text-muted-foreground"}>
								{user.description ? user.description : "No description"}
							</CardDescription>
						</CardHeader>

						<CardContent className="h-full ">
							<div className='min-h-screen'>
								{projects.map((project) => {
									return (
										<div key={project.name} className="mt-4">
											<ItemCard title={project.name} description={project.description} image={project.imageUrl} createdAt={project.createdAt} link={`/project/${project.name}`} type={project.type} isPrivate={project.status === "DRAFT"} />
										</div>
									);
								})}
							</div>
							
							<Pagination className="mt-10">
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
						</CardContent>

						<CardFooter className="">
							
						</CardFooter>
					</Card>
                </div>
            </div>
		</>
	);
}