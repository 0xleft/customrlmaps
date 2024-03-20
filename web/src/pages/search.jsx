import SearchSkeleton, { SearchItem } from "@/components/SearchSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/prisma";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PER_PAGE = 10;

export const getServerSideProps = async ({ req, res, params }) => {
	const count = await prisma.project.count({
		where: {
			deleted: false,
			publishStatus: "PUBLISHED",
		},
	});

	return {
		props: {
			maxPage: (Math.ceil(count / PER_PAGE) - 1),
		},
	};
};

export default function Search({ maxPage }) {
	console.log(maxPage);

	const params = useRouter().query;
	const page = params.page ? parseInt(params.page) : 0;
	const query = params.query ? params.query : "";
	const order = params.order ? params.order : "";
	const orderType = params.orderType ? params.orderType : "desc";
	const type = params.type ? params.type : "";
	const username = params.username ? params.username : "";
	const rating = params.rating ? parseInt(params.rating) : 0;

	const [loading, setLoading] = useState(true);
	const [projects, setProjects] = useState([]);

	const router = useRouter();

	function getProjects() {
		setLoading(true);
		router.replace(`/search?query=${query}&page=${page}&order=${order}&orderType=${orderType}&type=${type}&username=${username}&rating=${rating}`);

		fetch(`/api/project/search?query=${query}&page=${page}&order=${order}&orderType=${orderType}&type=${type}&username=${username}&rating=${rating}`)
		.then((res) => res.json()).then((data) => {
			if (data.error) {
				toast.error(data.error);
				setLoading(false);
				return;
			}

			setProjects(data.projects);
			setLoading(false);
		}).catch((error) => {
			toast.error("Error fetching projects");
			setLoading(false);
		});
	}

	useEffect(() => {
		getProjects();
	}, []);

	return (
		<>
			<div className='flex flex-row justify-center p-4 min-h-screen'>
                <div className='hidden lg:flex lg:w-[20%] p-2'>
					<Card className="w-full">
						<CardHeader>
							<CardTitle>
								Filters
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Button onClick={getProjects}>Search</Button>
						</CardContent>
					</Card>
                </div>

                <div className="w-full p-2 lg:w-[66%] min-h-screen">
                    <Card className="w-full h-full">
                        <CardHeader className="flex-col flex lg:hidden">
                                <CardTitle>
									Filters
                                    <div className='flex flex-row items-center space-x-2'>
                                    </div>
                                </CardTitle>
                        </CardHeader>

                        <CardContent className="mt-0 lg:mt-4 min-h-screen">

							<div className="mt-4 min-h-screen">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{loading ? <><SearchSkeleton/></> : <>
										{projects.map((project) => {
											return (
												<SearchItem key={project.name} project={project} />
											);
										})}
									</> }
								</div>
							</div>
							
							<Pagination className="mt-10">
									<PaginationContent>
										<PaginationItem>
										<PaginationPrevious href={page === 0 ? "#" : `/search?query=${query}&page=${page - 1}&order=${order}&orderType=${orderType}&type=${type}&username=${username}&rating=${rating}`} />
										</PaginationItem>
										<PaginationItem>
										<PaginationLink href={`/search?query=${query}&page=${0}&order=${order}&orderType=${orderType}&type=${type}&username=${username}&rating=${rating}`} aria-current="page">
											0
										</PaginationLink>
										</PaginationItem>
										<PaginationItem>
										<PaginationLink href="#" aria-current="page">
											{page}
										</PaginationLink>
										</PaginationItem>
										<PaginationItem>
										<PaginationEllipsis />
										</PaginationItem>
										<PaginationItem>
										<PaginationLink href={`/search?query=${query}&page=${maxPage}&order=${order}&orderType=${orderType}&type=${type}&username=${username}&rating=${rating}`} aria-current="page">
											{maxPage}
										</PaginationLink>
										</PaginationItem>
										<PaginationItem>
										<PaginationNext href={page >= maxPage ? "#" : `/search?query=${query}&page=${page + 1}&order=${order}&orderType=${orderType}&type=${type}&username=${username}&rating=${rating}`} />
										</PaginationItem>
									</PaginationContent>
								</Pagination>
						</CardContent>
                    </Card>
                </div>
            </div>
		</>
	);
}