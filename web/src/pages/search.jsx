import CustomError from "@/components/CustomError";
import SearchSkeleton, { SearchItem } from "@/components/SearchSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
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
	const params = useRouter().query;
	const [page, setPage] = useState(params.page ? parseInt(params.page) : 0);
	const [query, setQuery] = useState(params.query ? params.query : "");
	const [order, setOrder] = useState(params.order ? params.order : ""); // order by
	const [orderType, setOrderType] = useState(params.orderType ? params.orderType : "desc");
	const [type, setType] =  useState(params.type ? params.type : "");
	const [username, setUsername] = useState(params.username ? params.username : "");
	const [rating, setRating] = useState(params.rating ? parseInt(params.rating) : 0);

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

	useEffect(() => {
		getProjects();
	}, [page, query, order, orderType, type, username, rating]);

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
						<CardContent className="flex flex-col space-y-4">
							<div className="flex flex-col space-y-2">
								<Label>Rating: {rating}</Label>
								<Slider max={5} step={0.5} defaultValue={[rating]} onValueChange={(value) => {
									setRating(value[0]);
								}} />
							</div>
							
							<div>
								<Label>Order by:</Label>
								<Select onValueChange={(value) => {
									setOrder(value);
								}}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Order by" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
										<SelectItem value="createdAt">Date</SelectItem>
										<SelectItem value="downloads">Downloads</SelectItem>
										<SelectItem value="views">Views</SelectItem>
										<SelectItem value="averageRating">Rating</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							
							<div>
								<Label>Order type:</Label>
								<Select onValueChange={(value) => {
									setOrderType(value);
								}}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Order type" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
										<SelectItem value="desc">Descending</SelectItem>
										<SelectItem value="asc">Ascending</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							
							<div>
								<Label>Type:</Label>
								<Select onValueChange={(value) => {
									setType(value);
								}
								}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
										<SelectItem value="mod">Mod</SelectItem>
										<SelectItem value="map">Map</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							
							<div>
								<Label>Username:</Label>
								<Input type="text" value={username} onChange={(e) => {
									setUsername(e.target.value);
								}} className="w-full p-2 border border-gray-300 rounded-md" />
							</div>
							
							<div>
								<Label>Search:</Label>
								<Input type="text" value={query} onChange={(e) => {
									setQuery(e.target.value);
								}} className="w-full p-2 border border-gray-300 rounded-md" />
							</div>

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
							{/* todo better */}
							{projects.length === 0 && !loading ? <CustomError error={"404"}>
								<h2 className='text-muted-foreground'>No projects found</h2>
								<h2 className='text-muted-foreground text-sm'>Try a different query?</h2>
							</CustomError> : <></>}

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
										<PaginationPrevious href="#" onClick={() => {
											if (page <= 0) {
												return;
											}

											setPage(page - 1);
										}} />
										</PaginationItem>
										<PaginationItem>
										<PaginationLink href="#" onClick={() => {
											setPage(0);
										}}>
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
										<PaginationLink href="#" onClick={() => {
											setPage(maxPage);
										}}>
											{maxPage}
										</PaginationLink>
										</PaginationItem>
										<PaginationItem>
										<PaginationNext href="#" onClick={() => {
											if (page >= maxPage) {
												return;
											}

											setPage(page + 1);
										}} />
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