import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/router";

function SingleSeachSkeleton() {
	return (
		<>
			<div className="flex flex-col space-y-2 min-h-64 w-full">
				<Skeleton className="aspect-video" />
				<Skeleton className="h-6 w-1/2" />
				<div className="flex flex-row justify-between space-x-2">
					<Skeleton className="h-6 w-1/3" />
					<Skeleton className="h-6 w-1/3" />
				</div>
			</div>
		</>
	);
}

export function SearchItem({ project }) {
	const router = useRouter();

	return (
		<>
			<Card className="flex flex-col space-y-2 min-h-64 w-full hover:shadow-lg transition hover:scale-105 duration-75">
				<img src={project.imageUrl} className="aspect-video hover:cursor-pointer" onClick={() => {
					router.push(`/project/${project.name}`);
				}} />
				
				<div className="flex flex-row justify-between space-x-2">
					<div className="pl-2">
						<Link className="text-4xl" href={`/project/${project.name}`}
						>{project.name}</Link>

						<CardDescription>
							{project.description.length > 30 ? project.description.substring(0, 30) + "..." : project.description}
						</CardDescription>
					</div>

					<div>
						<Button>View</Button>
					</div>
				</div>

				
				
				
				<div className="flex flex-row justify-between space-x-2">
				</div>
			</Card>
		</>
	);
}

export default function SearchSkeleton() {
	return (
		<>
			{Array(12).fill(0).map((_, i) => (
				<SingleSeachSkeleton key={i} />
			))}
		</>
    );
};