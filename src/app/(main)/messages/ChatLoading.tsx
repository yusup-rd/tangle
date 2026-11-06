import { Skeleton } from "@/components/ui/skeleton";

export const ConversationListSkeleton = () => {
	return (
		<div
			role="status"
			aria-label="Loading conversations"
			className="grid gap-3 p-3"
		>
			{[0, 1, 2, 3].map((row) => (
				<div key={row} className="flex items-center gap-3">
					<Skeleton className="size-10 shrink-0 rounded-full" />
					<div className="min-w-0 flex-1 space-y-2">
						<Skeleton className="h-3 w-2/3" />
						<Skeleton className="h-3 w-4/5" />
					</div>
				</div>
			))}
		</div>
	);
};

export const MessageListSkeleton = () => {
	return (
		<div
			role="status"
			aria-label="Loading messages"
			className="grid w-full gap-3 p-4"
		>
			<Skeleton className="h-9 w-2/5 rounded-xl" />
			<Skeleton className="ml-auto h-9 w-1/2 rounded-xl" />
			<Skeleton className="h-9 w-1/3 rounded-xl" />
		</div>
	);
};

const ChatLoading = () => {
	return (
		<section
			className="flex min-h-[60dvh] w-full overflow-hidden rounded-lg bg-card shadow-sm"
			aria-busy="true"
		>
			<div className="w-full shrink-0 md:w-64 md:border-e lg:w-72">
				<div className="p-3">
					<h1 className="text-xl font-bold">Messages</h1>
				</div>
				<Skeleton className="mx-3 mb-2 h-9" />
				<ConversationListSkeleton />
			</div>
			<div className="hidden min-w-0 flex-1 md:block">
				<MessageListSkeleton />
			</div>
		</section>
	);
};

export default ChatLoading;
