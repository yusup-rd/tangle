import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
	Channel,
	ChannelHeader,
	ChannelHeaderProps,
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
	return (
		<div className={cn("min-w-0 flex-1 md:block", !open && "hidden")}>
			<WithComponents
				overrides={{ LoadingIndicator: MessageListSkeleton }}
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
						<CustomChannelHeader openSidebar={openSidebar} />
						<MessageList />
						<MessageComposer />
					</Window>
				</Channel>
			</WithComponents>
		</div>
	);
}

interface CustomChannelHeaderProps extends ChannelHeaderProps {
	openSidebar: () => void;
}

function CustomChannelHeader({
	openSidebar,
	...props
}: CustomChannelHeaderProps) {
	return (
		<div className="flex min-w-0 items-center">
			<div className="shrink-0 p-2 md:hidden">
				<Button
					size="icon"
					variant="ghost"
					aria-label="Open conversations"
					onClick={openSidebar}
				>
					<Menu className="size-5" />
				</Button>
			</div>
			<ChannelHeader {...props} />
		</div>
	);
}
