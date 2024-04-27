import Hero from '@/components/Hero';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { DownloadIcon, EyeOpenIcon, GlobeIcon, HeartIcon, RocketIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay"
import { useRef } from 'react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
  } from "@/components/ui/accordion"
import FAQ from '@/components/FAQ';
import Head from 'next/head';
import { Button } from '@/components/ui/button';

export default function Home() {
	const plugin = useRef(
		Autoplay({ delay: 3000, stopOnInteraction: false })
	)

	return (
		<>
			<Head>
				<title>Custom Rocket League Maps</title>
				<meta name="description" content="Custom Rocket League Maps is a platform that empowers creators of Rocket League maps and mods quickly share their creations and make the available to wider audience." />
			</Head>

			<Hero />

			{/* <div className="container">
				<div className="flex flex-col gap-2 w-full text-center lg:text-3xl md:text-2xl text-xl">
				<Carousel
				plugins={[plugin.current]}
				className="w-full"
				onMouseEnter={plugin.current.stop}
				onMouseLeave={plugin.current.reset}
				>
				<CarouselContent>
					{Array.from({ length: 5 }).map((_, index) => (
					<CarouselItem key={index} className="md:basis-1/3">
						<div className="p-1">
							<CardContent className="flex items-center justify-center p-6">
								<span className="text-sm text-muted-foreground">insert your brand here</span>
							</CardContent>
						</div>
					</CarouselItem>
					))}
				</CarouselContent>
				</Carousel>
				</div>
			</div> */}

			<div className="container">
				<section className="mx-auto flex max-w-[980px] flex-col items-center gap-8 pt-12 pb-24 md:py-24 lg:py-48 lg:pb-24">
                    <h1 className="text-center lg:text-6xl md:text-5xl text-3xl font-bold">About</h1>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						<Card className="flex flex-col items-center justify-center p-6 hover:shadow-lg transition hover:scale-105 duration-75 gap-2">	
							<CardTitle className="text-3xl font-bold flex flex-row items-center">
								<RocketIcon className="mr-2 w-8 h-8" />
							CRLM plugin</CardTitle>
							<CardDescription className="text-muted-foreground">An opensource bakkesmod plugin to quickly download and try out new maps and mods. Install <a target="_blank" href="https://github.com/pageuplt/CRLMPlugin/releases/latest/download/install.bat" className='underline'>here</a></CardDescription>
						</Card>
						<Card className="flex flex-col items-center justify-center p-6 hover:shadow-lg transition hover:scale-105 duration-75 gap-2">
							<CardTitle className="text-3xl font-bold flex flex-row items-center">
								<HeartIcon className="mr-2 w-8 h-8" />
							plusleft</CardTitle>
							<CardDescription className="text-muted-foreground">Me, the original creator of this platform. I can be reached on <a target="_blank" href="https://discord.com/users/406356211299123201" className='underline'>Discord</a> and <a className='underline' href="mailto:plusleft@customrlmaps.com">email</a></CardDescription>
						</Card>
						<Card className="flex flex-col items-center justify-center p-6 hover:shadow-lg transition hover:scale-105 duration-75 gap-2">
							<CardTitle className="text-3xl font-bold flex flex-row items-center">
								<GlobeIcon className="mr-2 w-8 h-8" />
							CRLM</CardTitle>
							<CardDescription className="text-muted-foreground">This is the platform that empowers creators of Rocket League maps and mods quickly share their creations and make the available to wider audience</CardDescription>
						</Card>
					</div>
				</section>
			</div>

			{/* big card with image on the left and text on the right with button to download the CRLMApp */}
			<div className="container">
				<section className="mx-auto flex flex-col items-center gap-8 pt-12 pb-24 md:py-24 lg:py-48 lg:pb-24">
					<Card className="flex flex-col items-center justify-center transition duration-75 gap-2 min-h-[400px] p-10">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex justify-center items-center">
								<img src="/crlmapp.png" className="aspect-video h-full w-full object-cover rounded-md" />
							</div>
							<div className="flex flex-col space-y-5 justify-center">
								<CardTitle className="text-3xl font-bold">CRLM app</CardTitle>
								<CardDescription className="text-muted-foreground">The CRLM app is the desktop application that allows you to easily download and install maps and mods. To play the selected map just create a LAN match with mutators you desire and play!</CardDescription>
								<div className="flex gap-4">
									<Button asChild>
										<Link href="https://github.com/pageuplt/CRLMApp/releases/latest/download/CRLM.exe">
											<DownloadIcon className="w-4 h-4" />
											Download
										</Link>
									</Button>
								</div>
							</div>
						</div>
					</Card>
				</section>

				<section className="mx-auto flex flex-col items-center gap-8 pt-12 pb-24 md:py-24 lg:py-24 lg:pb-24">
					<Card className="flex flex-col items-center justify-center p-10 transition duration-75 gap-2 min-h-[400px]">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col space-y-5 justify-center">
								<CardTitle className="text-3xl font-bold">CRLM plugin</CardTitle>
								<CardDescription className="text-muted-foreground">The CRLM plugin is a bakkesmod addition to for more experienced users. It is acompanied by more advanced features to aid with creation of custom maps. Multiplayer features are not guaranteed to work.</CardDescription>
								<div className="flex gap-4">
									<Button asChild>
										<Link href="https://github.com/pageuplt/CRLMPlugin/releases/latest/download/install.bat">
											<DownloadIcon className="w-4 h-4" />
											Install
										</Link>
									</Button>
								</div>
							</div>
							<div className="flex justify-center items-center">
								<img src="crlmplugin.png" className="aspect-video object-cover rounded-md" />
							</div>
						</div>
					</Card>
				</section>
			</div>

			<FAQ />
		</>
	);
}
