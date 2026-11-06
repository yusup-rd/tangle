import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { MailPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	ChannelList,
	ChannelListItemUI,
	ChannelListItemUIProps,
	useChatContext,
	WithComponents,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { ConversationListSkeleton } from "./ChatLoading";
import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
	open: boolean;
	onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
	const { user } = useSession();

	const queryClient = useQueryClient();

	const { channel } = useChatContext();

	useEffect(() => {
		if (channel?.id) {
			queryClient.invalidateQueries({
				queryKey: ["unread-messages-count"],
			});
		}
	}, [channel?.id, queryClient]);

	const ChannelPreviewCustom = useCallback(
		(props: ChannelListItemUIProps) => (
			<ChannelListItemUI
				{...props}
				onSelect={(event) => {
					if (props.onSelect) props.onSelect(event);
					else
						props.setActiveChannel?.(props.channel, props.watchers);
					onClose();
				}}
			/>
		),
		[onClose],
	);

	return (
		<div
			className={cn(
				"min-h-0 w-full shrink-0 flex-col md:flex md:w-64 md:border-e lg:w-72",
				open ? "flex" : "hidden",
			)}
		>
			<MenuHeader onClose={onClose} />
			<WithComponents
				overrides={{
					ChannelListItemUI: ChannelPreviewCustom,
					LoadingIndicator: ConversationListSkeleton,
				}}
			>
				<ChannelList
					filters={{
						type: "messaging",
						members: { $in: [user.id] },
					}}
					showChannelSearch
					options={{ state: true, presence: true, limit: 8 }}
					sort={{ last_message_at: -1 }}
				/>
			</WithComponents>
		</div>
	);
}

interface MenuHeaderProps {
	onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
	const [showNewChatDialog, setShowNewChatDialog] = useState(false);

	return (
		<>
			<div className="flex shrink-0 items-center gap-3 p-2">
				<div className="h-full md:hidden">
					<Button
						size="icon"
						variant="ghost"
						aria-label="Close conversations"
						onClick={onClose}
					>
						<X className="size-5" />
					</Button>
				</div>
				<h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>
				<Button
					size="icon"
					variant="ghost"
					title="Start new chat"
					onClick={() => setShowNewChatDialog(true)}
				>
					<MailPlus className="size-5" />
				</Button>
			</div>
			{showNewChatDialog && (
				<NewChatDialog
					onOpenChange={setShowNewChatDialog}
					onChatCreated={() => {
						setShowNewChatDialog(false);
						onClose();
					}}
				/>
			)}
		</>
	);
}
