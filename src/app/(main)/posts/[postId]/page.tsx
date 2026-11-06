import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import { Skeleton } from "@/components/ui/skeleton";
import UserProfile from "@/components/UserProfile";
import UserTooltip from "@/components/UserTooltip";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

interface PageProps {
	params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
	const post = await prisma.post.findUnique({
		where: {
			id: postId,
		},
		include: getPostDataInclude(loggedInUserId),
	});

	if (!post) notFound();

	return post;
});

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { postId } = await params;
	const { user } = await validateRequest();

	if (!user) return {};

	const post = await getPost(postId, user.id);

	return {
		title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
	};
}

export default async function Page({ params }: PageProps) {
	const { postId } = await params;
	const { user } = await validateRequest();

	if (!user) {
		return (
			<p className="text-destructive">
				You&apos;re not authorized to view this page.
			</p>
		);
	}

	const post = await getPost(postId, user.id);

	return (
		<main className="flex w-full min-w-0 gap-5">
			<div className="w-full min-w-0 space-y-5">
				<Post post={post} />
			</div>
			<div className="sticky top-21 hidden h-fit w-80 flex-none lg:block">
				<Suspense
					fallback={
						<Skeleton
							role="status"
							aria-label="Loading author"
							className="h-32 rounded-lg"
						/>
					}
				>
					<UserInfoSidebar user={post.user} />
				</Suspense>
			</div>
		</main>
	);
}

interface UserInfoSidebarProps {
	user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
	const { user: loggedInUser } = await validateRequest();

	if (!loggedInUser) return null;

	return (
		<div className="space-y-5 rounded-lg bg-card p-5 shadow-sm">
			<div className="text-xl font-bold">About this user</div>
			<UserTooltip user={user}>
				<Link
					href={`/users/${user.username}`}
					className="flex items-center gap-3"
				>
					<UserProfile
						avatarUrl={user.avatarUrl}
						className="flex-none"
					/>
					<div>
						<p className="line-clamp-1 font-semibold break-all hover:underline">
							{user.displayName}
						</p>
						<p className="line-clamp-1 break-all text-muted-foreground">
							@{user.username}
						</p>
					</div>
				</Link>
			</UserTooltip>
			<Linkify>
				<div className="line-clamp-6 break-words whitespace-pre-line text-muted-foreground">
					{user.bio}
				</div>
			</Linkify>
			{user.id !== loggedInUser.id && (
				<FollowButton
					userId={user.id}
					initialState={{
						followers: user._count.followers,
						isFollowedByUser: user.followers.some(
							({ followerId }) => followerId === loggedInUser.id,
						),
					}}
				/>
			)}
		</div>
	);
}
