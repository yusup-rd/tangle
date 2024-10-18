import { submitComment } from "@/components/comments/actions";
import { useToast } from "@/components/ui/use-toast";
import { CommentPage } from "@/lib/types";
import {
	InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";

export function useSubmitCommentMutation(postId: string) {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: submitComment,
		onSuccess: async (newComment) => {
			const queryKey = ["comments", postId];

			await queryClient.cancelQueries({ queryKey });

			queryClient.setQueryData<InfiniteData<CommentPage, string | null>>(
				queryKey,
				(oldData) => {
					const firstPage = oldData?.pages[0];

					if (firstPage) {
						return {
							pageParams: oldData.pageParams,
							pages: [
								{
									previousCursor: firstPage.previousCursor,
									comments: [
										...firstPage.comments,
										newComment,
									],
								},
								...oldData.pages.slice(1),
							],
						};
					}
				},
			);

			queryClient.invalidateQueries({
				queryKey,
				predicate(query) {
					return !query.state.data;
				},
			});

			toast({
				title: "Comment added",
			});
		},
		onError: (error) => {
			console.error(error);
			toast({
				variant: "destructive",
				description: "Failed to add comment. Please try again.",
			});
		},
	});

	return mutation;
}
