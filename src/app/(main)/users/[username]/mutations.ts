import { useToast } from "@/components/ui/use-toast";
import { PostPage } from "@/lib/types";
import { uploadFiles } from "@/lib/uploadthing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
	InfiniteData,
	QueryFilters,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions";

export function useUpdateProfileMutation() {
	const { toast } = useToast();

	const router = useRouter();

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async ({
			values,
			avatar,
		}: {
			values: UpdateUserProfileValues;
			avatar?: File;
		}) => {
			const updatedUser = await updateUserProfile(values);
			if (!avatar) return { updatedUser, avatarFailed: false };

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 60_000);
			try {
				const [result] = await uploadFiles("avatar", {
					files: [avatar],
					signal: controller.signal,
				});
				const avatarUrl = result?.serverData?.avatarUrl;
				if (typeof avatarUrl === "string" && avatarUrl) {
					return {
						updatedUser: { ...updatedUser, avatarUrl },
						avatarFailed: false,
					};
				}
			} catch (error) {
				console.error("Could not upload avatar", error);
			} finally {
				clearTimeout(timeout);
			}

			return { updatedUser, avatarFailed: true };
		},
		onSuccess: async ({ updatedUser, avatarFailed }) => {
			const queryFilter: QueryFilters = {
				queryKey: ["post-feed"],
			};

			await queryClient.cancelQueries(queryFilter);

			queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
				queryFilter,
				(oldData) => {
					if (!oldData) return;

					return {
						pageParams: oldData.pageParams,
						pages: oldData.pages.map((page) => ({
							nextCursor: page.nextCursor,
							posts: page.posts.map((post) => {
								if (post.user.id === updatedUser.id) {
									return {
										...post,
										user: updatedUser,
									};
								}
								return post;
							}),
						})),
					};
				},
			);

			router.refresh();

			if (avatarFailed) {
				toast({
					variant: "destructive",
					description:
						"Profile details were saved. Please retry the avatar upload.",
				});
			} else {
				toast({ description: "Profile updated" });
			}
		},
		onError(error) {
			console.error(error);
			toast({
				variant: "destructive",
				description: "Failed to update profile. Please try again.",
			});
		},
	});

	return mutation;
}
