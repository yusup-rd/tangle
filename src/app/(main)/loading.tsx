import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import { TrendsSidebarSkeleton } from "@/components/TrendsSidebar";

const Loading = () => {
	return (
		<main className="flex w-full min-w-0 gap-5">
			<div className="min-w-0 flex-1">
				<PostsLoadingSkeleton />
			</div>
			<TrendsSidebarSkeleton />
		</main>
	);
};

export default Loading;
