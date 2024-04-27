import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { GitHubLogoIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import Autoplay from "embla-carousel-autoplay"
import { toast } from "sonner";
const { ipcRenderer } = require('electron');

function Home() {
	const navigate = useNavigate();

	const plugin = useRef(Autoplay({ active: true, delay: 2000, stopOnInteraction: false, stopOnMouseEnter: false, stopOnFocusIn: false, stopOnLastSnap: false }))
	const plugin2 = useRef(Autoplay({ active: true, delay: 2250, stopOnInteraction: false, stopOnMouseEnter: false, stopOnFocusIn: false, stopOnLastSnap: false }))
	const plugin3 = useRef(Autoplay({ active: true, delay: 2600, stopOnInteraction: false, stopOnMouseEnter: false, stopOnFocusIn: false, stopOnLastSnap: false }))

	const [projects, setProjects] = useState([]);
	const [projects2, setProjects2] = useState([]);
	const [projects3, setProjects3] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		ipcRenderer.invoke('search', `https://customrlmaps.com/api/project/search?query=&page=0&order=views&orderType=desc&type=&username=&rating=`)
		.then((data) => {
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
		ipcRenderer.invoke('search', `https://customrlmaps.com/api/project/search?query=&page=0&order=downloads&orderType=desc&type=&username=&rating=`)
		.then((data) => {
			if (data.error) {
				toast.error(data.error);
				setLoading(false);
				return;
			}

			setProjects2(data.projects);
			setLoading(false);
		}).catch((error) => {
			toast.error("Error fetching projects");
			setLoading(false);
		});
		ipcRenderer.invoke('search', `https://customrlmaps.com/api/project/search?query=&page=0&order=updatedAt&orderType=desc&type=&username=&rating=`)
		.then((data) => {
			if (data.error) {
				toast.error(data.error);
				setLoading(false);
				return;
			}

			setProjects3(data.projects);
			setLoading(false);
		}).catch((error) => {
			toast.error("Error fetching projects");
			setLoading(false);
		});
	}, []);
	
	return (
		<>
			<div>
				<div className="container">
					<section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 pt-32 pb-0 md:py-24 lg:py-24 lg:pb-20">
						<h1 className="text-center lg:text-6xl md:text-5xl text-4xl font-bold">CustomRLMaps</h1>
						<p className="text-center lg:text-2xl md:text-xl text-sm text-muted-foreground break-words md:max-w-[400px] max-w-[300px]">Rocket League projects made easy.</p>

						<div className="flex flex-row md:flex-row gap-4">
							<Button className="mt-4 h-9 block md:hidden lg:hidden"
								onClick={() => {
									navigate("/search");
								}}
							>
								Search
							</Button>
							<Button className="mt-4 h-9 space-x-2 hidden md:block lg:block"
								onClick={() => {
									navigate("/search");
								}}
							>
								Search public projects
							</Button>
							<Button className="mt-4 h-9 space-x-2" variant="outline"
								onClick={() => {
									require('electron').shell.openExternal("https://github.com/pageuplt");
								}}
							>
								<GitHubLogoIcon className="mr-2" /> GitHub
							</Button>
						</div>
					</section>
				</div>

				<h1 className="text-center lg:text-5xl md:text-4xl text-3xl font-bold mb-2">Best of the best</h1>
				<div className="container mb-10 mt-10">

					<p className="text-muted-foreground text-center text-sm">Most viewed</p>

					<div className="flex flex-col gap-2 w-full text-center lg:text-3xl md:text-2xl text-xl">
						<Carousel
							plugins={[plugin.current]}
							className="w-full"
							onMouseEnter={plugin.current.stop}
							onMouseLeave={plugin.current.play}
							>
							<CarouselContent>
								{projects.map((project, index) => (
								<CarouselItem key={index} className="md:basis-1/3">
									<div className="p-1">
										<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105">
											<img src={project.imageUrl} alt={project.name} className="absolute top-0 left-0 w-[50%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
											onClick={() => navigate("/search")} />
											<CardContent className="ml-[50%]">
												<div className="text-left text-md mt-2 hover:underline hover:cursor-pointer" onClick={() =>navigate("/search")}>
													{project.name}
												</div>
												<p className="text-muted-foreground text-left text-sm pt-4">
													{project.views} views
												</p>
											</CardContent>
										</Card>
									</div>
								</CarouselItem>
								))}
								{projects.length < 10 && (
									Array.from({ length: 5 - projects.length }).map((_, index) => (
										<CarouselItem key={index} className="pt-1 basis-1/3">
											<div className="p-1">
												<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105 justify-center items-center">
													<h1
													className="pt-4 text-3xl font-bold text-center text-muted-foreground"
													>TBD</h1>
													<p className="text-muted-foreground text-center text-sm">
														To be determined
													</p>
												</Card>
											</div>
										</CarouselItem>
									))
								)}
							</CarouselContent>
						</Carousel>
					</div>
				</div>

				<p className="text-muted-foreground text-center text-sm">Most downloaded</p>

				<div className="container mb-10">
					<div className="flex flex-col gap-2 w-full text-center lg:text-3xl md:text-2xl text-xl">
					<Carousel
							plugins={[plugin2.current]}
							className="w-full"
							onMouseEnter={plugin2.current.stop}
							onMouseLeave={plugin2.current.play}
							>
							<CarouselContent>
								{projects2.map((project, index) => (
								<CarouselItem key={index} className="md:basis-1/3">
									<div className="p-1">
										<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105">
											<img src={project.imageUrl} alt={project.name} className="absolute top-0 left-0 w-[50%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
											onClick={() => navigate("/search")} />
											<CardContent className="ml-[50%]">
												<div className="text-left text-md mt-2 hover:underline hover:cursor-pointer" onClick={() =>navigate("/search")}>
													{project.name}
												</div>
												<p className="text-muted-foreground text-left text-sm pt-4">
													{project.downloads} downloads
												</p>
											</CardContent>
										</Card>
									</div>
								</CarouselItem>
								))}
								{projects2.length < 10 && (
									Array.from({ length: 5 - projects2.length }).map((_, index) => (
										<CarouselItem key={index} className="pt-1 basis-1/3">
											<div className="p-1">
												<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105 justify-center items-center">
													<h1
													className="pt-4 text-3xl font-bold text-center text-muted-foreground"
													>TBD</h1>
													<p className="text-muted-foreground text-center text-sm">
														To be determined
													</p>
												</Card>
											</div>
										</CarouselItem>
									))
								)}
							</CarouselContent>
						</Carousel>
					</div>
				</div>

				<p className="text-muted-foreground text-center text-sm">Last updated</p>

				<div className="container">
					<div className="flex flex-col gap-2 w-full text-center lg:text-3xl md:text-2xl text-xl">
					<Carousel
							plugins={[plugin3.current]}
							className="w-full"
							onMouseEnter={plugin3.current.stop}
							onMouseLeave={plugin3.current.play}
							>
							<CarouselContent>
								{projects3.map((project, index) => (
								<CarouselItem key={index} className="md:basis-1/3">
									<div className="p-1">
										<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105">
											<img src={project.imageUrl} alt={project.name} className="absolute top-0 left-0 w-[50%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
											onClick={() => navigate("/search")} />
											<CardContent className="ml-[50%]">
												<div className="text-left text-md mt-2 hover:underline hover:cursor-pointer" onClick={() =>navigate("/search")}>
													{project.name}
												</div>
												<p className="text-muted-foreground text-left text-sm pt-4">
													{project.downloads} downloads
												</p>
											</CardContent>
										</Card>
									</div>
								</CarouselItem>
								))}
								{projects3.length < 10 && (
									Array.from({ length: 5 - projects3.length }).map((_, index) => (
										<CarouselItem key={index} className="pt-1 basis-1/3">
											<div className="p-1">
												<Card className="relative overflow-hidden h-[100px] hover:shadow-lg transition-all hover:scale-105 justify-center items-center">
													<h1
													className="pt-4 text-3xl font-bold text-center text-muted-foreground"
													>TBD</h1>
													<p className="text-muted-foreground text-center text-sm">
														To be determined
													</p>
												</Card>
											</div>
										</CarouselItem>
									))
								)}
							</CarouselContent>
						</Carousel>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home