"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";

interface MessagesButtonProps {
	initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
	const { data } = useQuery({
		queryKey: ["unread-messages-count"],
		queryFn: () =>
			kyInstance
				.get("/api/messages/unread-count")
				.json<MessageCountInfo>(),
		initialData: initialState,
		refetchInterval: 60 * 1000,
	});

	return (
		<Button
			variant="ghost"
			className="flex min-w-11 items-center justify-start gap-3 max-sm:h-auto max-sm:min-h-12 max-sm:flex-col max-sm:justify-center max-sm:gap-0.5 max-sm:px-1.5 max-sm:py-1"
			title="Messages"
			asChild
		>
			<Link
				href="/messages"
				aria-label={`Messages${data.unreadCount ? ` (${data.unreadCount} unread)` : ""}`}
			>
				<div className="relative">
					<Mail className="size-5 shrink-0" aria-hidden="true" />
					{!!data.unreadCount && (
						<span className="absolute -top-1 -right-1 rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground tabular-nums">
							{data.unreadCount}
						</span>
					)}
				</div>
				<span className="text-xs sm:max-lg:hidden lg:text-sm">
					Messages
				</span>
			</Link>
		</Button>
	);
}
