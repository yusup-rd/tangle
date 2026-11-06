"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useState } from "react";
import { ChannelSearchSource, SearchController } from "stream-chat";
import { Chat as StreamChat } from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";

export default function Chat() {
	const { chatClient, connectionFailed } = useInitializeChatClient();

	const { resolvedTheme } = useTheme();

	const [sidebarOpen, setSidebarOpen] = useState(true);
	const closeSidebar = useCallback(() => setSidebarOpen(false), []);
	const searchController = useMemo(() => {
		if (!chatClient?.userID) return undefined;
		return new SearchController({
			sources: [
				new ChannelSearchSource(chatClient, {
					filters: {
						type: "messaging",
						members: { $in: [chatClient.userID] },
					},
				}),
			],
		});
	}, [chatClient]);

	if (connectionFailed) {
		return (
			<section className="flex w-full flex-col items-center gap-3 rounded-lg bg-card p-6">
				<p role="alert">Messages are unavailable right now.</p>
				<Button onClick={() => window.location.reload()}>
					Try again
				</Button>
			</section>
		);
	}
	if (!chatClient) {
		return (
			<div
				role="status"
				className="mx-auto flex h-fit items-center gap-2 py-3"
			>
				<Loader2
					className="size-5 motion-safe:animate-spin"
					aria-hidden="true"
				/>
				Connecting to messages...
			</div>
		);
	}

	return (
		<main className="tangle-chat relative min-h-[60dvh] w-full overflow-hidden rounded-lg bg-card shadow-sm">
			<div className="absolute top-0 bottom-0 flex w-full">
				<StreamChat
					client={chatClient}
					searchController={searchController}
					theme={
						resolvedTheme === "dark"
							? "str-chat__theme-dark"
							: "str-chat__theme-light"
					}
				>
					<ChatSidebar open={sidebarOpen} onClose={closeSidebar} />
					<ChatChannel
						open={!sidebarOpen}
						openSidebar={() => setSidebarOpen(true)}
					/>
				</StreamChat>
			</div>
		</main>
	);
}
