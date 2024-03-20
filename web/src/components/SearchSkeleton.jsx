import { Skeleton } from "./ui/skeleton";

function SingleSeachSkeleton() {
	return (
		<>
			<Skeleton className="h-12 w-full" />
		</>
	);
}

export default function SearchSkeleton() {
	return (
		<>
			{Array(10).fill(0).map((_, i) => (
				<SingleSeachSkeleton key={i} />
			))}
		</>
    );
};