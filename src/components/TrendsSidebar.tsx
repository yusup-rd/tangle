import { validateRequest } from "@/auth";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FollowButton from "./FollowButton";
import UserProfile from "./UserProfile";

export default function TrendsSidebar() {
	return (
		<div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-5 md:block lg:w-80">
			<Suspense
				fallback={
					<Skeleton
						role="status"
						aria-label="Loading suggestions and trends"
						className="h-48 rounded-lg"
					/>
				}
			>
				<Follow />
				<TrendingTopics />
			</Suspense>
		</div>
	);

	async function Follow() {
		const { user } = await validateRequest();

		if (!user) return null;

		const usersToFollow = await prisma.user.findMany({
			where: {
				NOT: {
					id: user?.id,
				},
				followers: {
					none: {
						followerId: user.id,
					},
				},
			},
			select: getUserDataSelect(user.id),
			take: 5,
		});

		if (!usersToFollow.length) return null;

		return (
			<div className="space-y-5 rounded-lg bg-card p-5 shadow-sm">
				<div className="text-xl font-bold">Who to follow</div>
				{usersToFollow.map((user) => (
					<div
						key={user.id}
						className="flex items-center justify-between gap-3"
					>
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
						<FollowButton
							userId={user.id}
							initialState={{
								followers: user._count.followers,
								isFollowedByUser: user.followers.some(
									({ followerId }) => followerId === user.id,
								),
							}}
						/>
					</div>
				))}
			</div>
		);
	}
}

const getTrendingTopics = unstable_cache(
	async () => {
		const result = await prisma.$queryRaw<
			{ hashtag: string; count: bigint }[]
		>`
            WITH hashtags AS (
                SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag
                FROM posts
            )
            SELECT hashtag, COUNT(*) AS count
            FROM hashtags
            GROUP BY hashtag
            ORDER BY count DESC, hashtag ASC
            LIMIT 5
        `;

		return result.map((row) => ({
			hashtag: row.hashtag,
			count: Number(row.count),
		}));
	},
	["trending_topics"],
	{
		revalidate: 3 * 60 * 60,
	},
);

async function TrendingTopics() {
	const trendingTopics = await getTrendingTopics();
	if (!trendingTopics.length) return null;

	return (
		<div className="space-y-5 rounded-lg bg-card p-5 shadow-sm">
			<div className="text-xl font-bold">Trending topics</div>
			{trendingTopics.map(({ hashtag, count }) => {
				const title = hashtag.split("#")[1];

				return (
					<Link
						key={title}
						href={`/hashtag/${title}`}
						className="block"
					>
						<p
							className="line-clamp-1 font-semibold break-all hover:underline"
							title={hashtag}
						>
							{hashtag}
						</p>
						<p className="text-sm text-muted-foreground">
							{formatNumber(count)}{" "}
							{count === 1 ? "post" : "posts"}
						</p>
					</Link>
				);
			})}
		</div>
	);
}
