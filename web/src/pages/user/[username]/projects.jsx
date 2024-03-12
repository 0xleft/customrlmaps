import { Inter } from "next/font/google";
import prisma from "@/lib/prisma";
import CustomError from "@/components/CustomError";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAllUserInfo } from "@/utils/apiUtils";

const inter = Inter({ subsets: ["latin"] });

const PER_PAGE = 10

export const getServerSideProps = async ({ req, res, params }) => {
	res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

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

	const page = new URL(req.url, "https://localhost").searchParams.get('page') || 1;

	const projects = await prisma.project.findMany(
		{
			where: {
				userId: dbUser.id,
				publishStatus: (currentUser && currentUser.id === dbUser.id) ? undefined : "PUBLISHED",
			},
			take: PER_PAGE,
			skip: (page - 1) * PER_PAGE,
			orderBy: {
				createdAt: "desc",
			},
		}
	);

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
					likes: project.likes,
				};
			}),
		},
	};
};

export default function projects({ user, projects, notFound }) {

	if (notFound) {
		return (
			<CustomError error="404">
				<p>User not found</p>
			</CustomError>
		);
	}

	return (
		<>
            <div className="container p-4">
                <Card className="w-full">
                    <CardHeader className="flex flex-col">
                        <CardTitle>
							{user.username}'s projects
                        </CardTitle>
					</CardHeader>

					<CardContent>
						{projects.map((project) => {
							return (
								<div key={project.name}>
									<h2>{project.name}</h2>
									<p>{project.description}</p>
									<img src={project.imageUrl} />
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>
		</>
	);
}