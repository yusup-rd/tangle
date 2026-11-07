import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useCallback } from "react";
import {
	Channel,
	ChannelHeader,
	MessageComposer,
	MessageList,
	Window,
	WithComponents,
} from "stream-chat-react";
import { MessageListSkeleton } from "./ChatLoading";

interface ChatChannelProps {
	open: boolean;
	openSidebar: () => void;
}

export default function ChatChannel({ open, openSidebar }: ChatChannelProps) {
	const HeaderStartContent = useCallback(() => {
		return (
			<Button
				size="icon"
				variant="ghost"
				className="size-11 md:hidden"
				aria-label="Back to conversations"
				onClick={openSidebar}
			>
				<ChevronLeft
					className="size-5 rtl:rotate-180"
					aria-hidden="true"
				/>
			</Button>
		);
	}, [openSidebar]);

	return (
		<div className={cn("min-w-0 flex-1 md:block", !open && "hidden")}>
			<WithComponents
				overrides={{
					HeaderStartContent,
					LoadingIndicator: MessageListSkeleton,
				}}
			>
				<Channel
					EmptyPlaceholder={
						<div className="flex h-full flex-col items-center justify-center gap-3 p-4">
							<p className="text-muted-foreground">
								Choose a conversation to see its messages.
							</p>
							<Button
								className="md:hidden"
								variant="outline"
								onClick={openSidebar}
							>
								Open conversations
							</Button>
						</div>
					}
				>
					<Window>
						<ChannelHeader />
						<MessageList />
						<MessageComposer />
					</Window>
				</Channel>
			</WithComponents>
		</div>
	);
}
