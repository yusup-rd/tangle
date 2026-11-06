import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home } from "lucide-react";
import Link from "next/link";
import { cache } from "react";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
	className?: string;
}

const getUnreadCounts = cache((userId: string) =>
	Promise.all([
		prisma.notification
			.count({
				where: {
					recipientId: userId,
					read: false,
				},
			})
			.catch(() => {
				console.error("Could not load unread notification count");
				return 0;
			}),
		streamServerClient.getUnreadCount(userId).then(
			(result) => result.total_unread_count,
			() => {
				console.error("Could not load unread chat count");
				return 0;
			},
		),
	]),
);

export default async function MenuBar({ className }: MenuBarProps) {
	const { user } = await validateRequest();

	if (!user) return null;

	const [unreadNotificationCount, unreadMessagesCount] =
		await getUnreadCounts(user.id);

	return (
		<nav aria-label="Main navigation" className={className}>
			<Button
				variant="ghost"
				className="flex min-w-11 items-center justify-start gap-3 max-sm:h-auto max-sm:min-h-12 max-sm:flex-col max-sm:justify-center max-sm:gap-0.5 max-sm:px-1.5 max-sm:py-1"
				title="Home"
				asChild
			>
				<Link href="/" aria-label="Home">
					<Home className="size-5 shrink-0" aria-hidden="true" />
					<span className="text-xs sm:max-lg:hidden lg:text-sm">
						Home
					</span>
				</Link>
			</Button>
			<NotificationsButton
				initialState={{ unreadCount: unreadNotificationCount }}
			/>
			<MessagesButton
				initialState={{ unreadCount: unreadMessagesCount }}
			/>
			<Button
				variant="ghost"
				className="flex min-w-11 items-center justify-start gap-3 max-sm:h-auto max-sm:min-h-12 max-sm:flex-col max-sm:justify-center max-sm:gap-0.5 max-sm:px-1.5 max-sm:py-1"
				title="Bookmarks"
				asChild
			>
				<Link href="/bookmarks" aria-label="Bookmarks">
					<Bookmark className="size-5 shrink-0" aria-hidden="true" />
					<span className="text-xs sm:max-lg:hidden lg:text-sm">
						Bookmarks
					</span>
				</Link>
			</Button>
		</nav>
	);
}
