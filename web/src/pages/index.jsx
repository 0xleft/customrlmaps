import Hero from '@/components/Hero';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { DownloadIcon, EyeOpenIcon } from '@radix-ui/react-icons';
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

export default function Home() {
	const plugin = useRef(
		Autoplay({ delay: 3000, stopOnInteraction: false })
	)

	return (
		<>
			<Hero />

			<div className="container">
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
			</div>

			<FAQ />
		</>
	);
}
