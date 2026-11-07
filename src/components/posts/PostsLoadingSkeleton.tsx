import { Skeleton } from "../ui/skeleton";

export default function PostsLoadingSkeleton() {
	return (
		<div
			role="status"
			aria-label="Loading posts"
			className="w-full space-y-5"
		>
			<PostLoadingSkeleton />
			<PostLoadingSkeleton />
			<PostLoadingSkeleton />
		</div>
	);
}

export const PostLoadingSkeleton = () => {
	return (
		<div className="w-full space-y-3 rounded-lg bg-card p-5 shadow-sm">
			<div className="flex flex-wrap gap-3">
				<Skeleton className="size-12 rounded-full" />
				<div className="space-y-1.5">
					<Skeleton className="h-4 w-24 rounded" />
					<Skeleton className="h-4 w-20 rounded" />
				</div>
			</div>
			<Skeleton className="h-16 rounded" />
		</div>
	);
};
