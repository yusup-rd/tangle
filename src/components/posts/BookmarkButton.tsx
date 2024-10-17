import { BookmarkInfo } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import {
	QueryKey,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
	postId: string;
	initialState: BookmarkInfo;
}

export default function BookmarkButton({
	postId,
	initialState,
}: BookmarkButtonProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const queryKey: QueryKey = ["bookmark-info", postId];

	const { data } = useQuery({
		queryKey: ["bookmark-info", postId],
		queryFn: () =>
			kyInstance
				.get(`api/posts/${postId}/bookmarks`)
				.json<BookmarkInfo>(),
		initialData: initialState,
		staleTime: Infinity,
	});

	const { mutate } = useMutation({
		mutationFn: () =>
			data.isBookmarkedByUser
				? kyInstance.delete(`api/posts/${postId}/bookmarks`)
				: kyInstance.post(`api/posts/${postId}/bookmarks`),

		onMutate: async () => {
			toast({
				description: `Post is ${data.isBookmarkedByUser ? "removed from " : "added to "}bookmarks`,
			});

			await queryClient.cancelQueries({ queryKey });
			const previousState =
				queryClient.getQueryData<BookmarkInfo>(queryKey);

			queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
				isBookmarkedByUser: !previousState?.isBookmarkedByUser,
			}));

			return { previousState };
		},

		onError(error, variables, context) {
			queryClient.setQueryData(queryKey, context?.previousState);
			console.error(error);
			toast({
				variant: "destructive",
				description: "Something went wrong. Please try again.",
			});
		},
	});

	return (
		<button onClick={() => mutate()} className="flex items-center gap-2">
			<Bookmark
				className={cn(
					"size-5",
					data.isBookmarkedByUser && "fill-primary text-primary",
				)}
			/>
		</button>
	);
}
