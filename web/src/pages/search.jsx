import SearchSkeleton from "@/components/SearchSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Search() {

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

			setProjects([]);
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
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
									{loading ? <><SearchSkeleton/></> : <>
										{projects.map((project) => {
											return (
												<div key={project.name} className="mt-4">
													<ProjectCard project={project} />
												</div>
											);
										})};
									</> }
								</div>
							</div>
							
							<Pagination className="mt-10">
									<PaginationContent>
										<PaginationItem>
										{/* <PaginationPrevious href={page === 1 ? "#" : `/user/${user.username}/projects?page=${page - 1}`} /> */}
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
										{/* <PaginationNext href={page === 0 ? "#" : `/user/${user.username}/projects?page=${page + 1}`} /> */}
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