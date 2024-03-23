import FAQ from "@/components/FAQ";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getNiceNumber } from "@/utils/numberUtils";
import axios from "axios";
import { useRouter } from "next/router";

export const getServerSideProps = async ({ req, res }) => {
	res.setHeader(
		'Cache-Control',
		'public, s-maxage=10, stale-while-revalidate=360'
	);

	const recentPromise = axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/project/search?query=&page=0&order=updatedAt&orderType=asc&type=&username=&rating=0`);
	const popularPromise = axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/project/search?query=&page=0&order=views&orderType=desc&type=&username=&rating=0`);
	const bestPromise = axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/project/search?query=&page=0&order=averageRating&orderType=desc&type=&username=&rating=0`);

	const [recent, popular, best] = await Promise.all([recentPromise, popularPromise, bestPromise]);

	return {
		props: {
			recent: recent.data.projects.map((project) => {
				return {
					type: project.type,
					name: project.name,
					imageUrl: project.imageUrl,
					description: project.description,
					updated: project.updated,
				}
			}),

			popular: popular.data.projects.map((project) => {
				return {
					type: project.type,
					name: project.name,
					imageUrl: project.imageUrl,
					description: project.description,
					views: project.views,
				}
			}),

			best: best.data.projects.map((project) => {
				return {
					type: project.type,
					name: project.name,
					imageUrl: project.imageUrl,
					description: project.description,
					rating: project.averageRating,
				}
			}),
		},
	};
};

export default function Explore({ recent, popular, best }) {

	const router = useRouter();

	return (
		<>
			<div className="container">
                <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 pt-32 pb-24 md:py-24 lg:py-24 lg:pb-20">
                    <h1 className="text-center lg:text-6xl md:text-5xl text-3xl font-bold">Explore</h1>
                </section>

				<div className="text-center grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:grid-cols-3 h-full">
					<div className="flex flex-col items-center justify-center p-6">
						<div>
							<div className="text-3xl font-bold">Best</div>
							<div className="text-muted-foreground">Highest rated projects</div>
						</div>

						<Carousel
							opts={{
								align: "start",
							}}
							orientation="vertical"
							className="w-full h-[300px]"
							>
							<CarouselContent className="-mt-1 h-[300px]">
								{best.map((project, index) => (
								<CarouselItem key={index} className="pt-1 basis-1/3">
									<div className="p-1">
									<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105">
										<img src={project.imageUrl} alt={project.name} className="absolute top-0 left-0 w-[33%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
										onClick={() => router.push(`/project/${project.name}`)} />
										<CardContent className="ml-[33%]">
											<div className="text-left text-md mt-2 hover:underline hover:cursor-pointer" onClick={() => router.push(`/project/${project.name}`)}>
											{project.name} <Badge>{project.type}</Badge>
											</div>
											<p className="text-left text-sm text-muted-foreground overflow-clip">
											{project.description.length > 30 ? project.description.substring(0, 30) + "..." : project.description}
											</p>
											<p className="text-muted-foreground text-left text-sm pt-4">
												Rating: {project.rating === 0 ? "No rating" : project.rating.toFixed(1)}
											</p>
										</CardContent>
									</Card>
									</div>
								</CarouselItem>
								))}
							</CarouselContent>
							<CarouselNext />
						</Carousel>
					</div>

					<div className="flex flex-col items-center justify-center p-6">
						<div>
							<div className="text-3xl font-bold">Recent</div>
							<div className="text-muted-foreground">Newly added projects</div>
						</div>

						<Carousel
							opts={{
								align: "start",
							}}
							orientation="vertical"
							className="w-full h-[300px]"
							>
							<CarouselContent className="-mt-1 h-[300px]">
								{recent.map((project, index) => (
								<CarouselItem key={index} className="pt-1 basis-1/3">
									<div className="p-1">
									<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105">
										<img src={project.imageUrl} alt={project.name} className="absolute top-0 left-0 w-[33%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
										onClick={() => router.push(`/project/${project.name}`)} />
										<CardContent className="ml-[33%]">
											<div className="text-left text-md mt-2 hover:underline hover:cursor-pointer" onClick={() => router.push(`/project/${project.name}`)}>
											{project.name} <Badge>{project.type}</Badge>
											</div>
											<p className="text-left text-sm text-muted-foreground overflow-clip">
											{project.description.length > 30 ? project.description.substring(0, 30) + "..." : project.description}
											</p>
											<p className="text-muted-foreground text-left text-sm pt-4">
												Updated: {project.updated}
											</p>
										</CardContent>
									</Card>
									</div>
								</CarouselItem>
								))}
							</CarouselContent>
							<CarouselNext />
						</Carousel>
					</div>
					<div className="flex flex-col items-center justify-center p-6">
						<div>
							<div className="text-3xl font-bold">Popular</div>
							<div className="text-muted-foreground">Most viewed projects</div>
						</div>

						<Carousel
							opts={{
								align: "start",
							}}
							orientation="vertical"
							className="w-full h-[300px]"
							>
							<CarouselContent className="-mt-1 h-[300px]">
								{popular.map((project, index) => (
								<CarouselItem key={index} className="pt-1 basis-1/3">
									<div className="p-1">
									<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105">
										<img src={project.imageUrl} alt={project.name} className="absolute top-0 left-0 w-[33%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
										onClick={() => router.push(`/project/${project.name}`)} />
										<CardContent className="ml-[33%]">
											<div className="text-left text-md mt-2 hover:underline hover:cursor-pointer" onClick={() => router.push(`/project/${project.name}`)}>
											{project.name} <Badge>{project.type}</Badge>
											</div>
											<p className="text-left text-sm text-muted-foreground overflow-clip">
											{project.description.length > 30 ? project.description.substring(0, 30) + "..." : project.description}
											</p>
											<p className="text-muted-foreground text-left text-sm pt-4">
												Views: {getNiceNumber(project.views)}
											</p>
										</CardContent>
									</Card>
									</div>
								</CarouselItem>
								))}
							</CarouselContent>
							<CarouselNext />
						</Carousel>

					</div>
				</div>
            </div>

			<FAQ />
		</>
	);
}