import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/router";
import { DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/react-dropdown-menu";

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

	function getNiceNumber(number) {
		if (number < 1000) {
			return number;
		}
	
		if (number < 1000000) {
			return (number / 1000).toFixed(1) + "k";
		}
	
		return (number / 1000000).toFixed(1) + "m";
	}

	return (
		<>
			<Card className="flex flex-col space-y-2 min-h-64 w-full hover:shadow-lg transition hover:scale-105 duration-75">
				<img src={project.imageUrl} className="aspect-video hover:cursor-pointer" onClick={() => {
					router.push(`/project/${project.name}`);
				}} />
				
				<div className="flex flex-col justify-between space-x-2">
					<Link className="pl-2 text-xl hover:underline" href={`/project/${project.name}`}
					>{
						project.name
					}</Link>

					<CardDescription className="h-full text-clip text-md">
						By <Link href={`/user/${project.user}`} className="hover:underline">@{project.user}</Link>
					</CardDescription>
				</div>

				<div className="flex flex-row justify-between space-x-2 h-full">
					<div className="flex flex-row space-x-2 min-h-8 items-center justify-center w-full">
						<p className="flex flex-row items-center">
							<EyeOpenIcon />
							{getNiceNumber(project.views)} views
						</p>
					</div>
					<div className="flex flex-row space-x-2 min-h-8 items-center justify-center w-full">
						<p className="flex flex-row items-center">
							<DownloadIcon />
							{getNiceNumber(project.downloads)} downloads
						</p>
					</div>
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