import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/router";
import { DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { AspectRatio } from "./ui/aspect-ratio";
import { getNiceNumber } from "@/utils/numberUtils";
import { Badge } from "./ui/badge";

function SingleSeachSkeleton() {
	return (
		<>
			<div className="flex flex-col space-y-4 w-full">
				<Skeleton className="aspect-video" />
				<Skeleton className="h-6 w-1/2" />

				<div className="flex flex-row justify-between space-x-4">
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
			{/* <Card className="flex flex-col space-y-2 min-h-80 w-full hover:shadow-lg transition hover:scale-105 duration-75">
				<img src={project.imageUrl} className="hover:cursor-pointer w-full max-h-52 aspect-video object-cover" onClick={() => {
					router.push(`/project/${project.name}`);
				}} />
				
				<div className="flex flex-col justify-between space-x-2 pb-4">
					<Link className="pl-2 text-xl hover:underline" href={`/project/${project.name}`}
					>{
						project.name
					}</Link>

					<CardDescription className="h-full text-clip text-md overflow-clip break-words">
						{project.description.length > 60 ? project.description.substring(0, 60) + "..." : project.description}
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
			</Card> */}
			<Card>
				<div className="flex flex-col w-full">
					<img src={project.imageUrl} className="hover:cursor-pointer w-full aspect-video object-cover rounded-md" onClick={() => {
						router.push(`/project/${project.name}`);
					}} />

					<div className="p-2 space-y-2">
						<h1 className="text-xl font-bold hover:cursor-pointer hover:underline"
							onClick={() => {
								router.push(`/project/${project.name}`);
							}}
						>{project.name}
							<Badge className="ml-2">{project.type}</Badge>
						</h1>
						<CardDescription className="text-clip overflow-clip break-words pb-4 hover:cursor-pointer hover:underline"
							onClick={() => {
								router.push(`/user/${project.user}`);
							}}
						>
							By @{project.user}
						</CardDescription>
						<div className="flex flex-row justify-between space-x-2 overflow-hidden">
							<div className="h-6 w-full flex flex-row justify-center items-center">
								<DownloadIcon className="w-4 h-4 inline" />
								{getNiceNumber(project.downloads)}
							</div>
							<div className="h-6 w-full flex flex-row justify-center items-center">
								<EyeOpenIcon className="w-4 h-4 inline" />
								{getNiceNumber(project.views)}
							</div>
						</div>
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