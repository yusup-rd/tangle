import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
	const { user } = useSession();
	const [chatClient, setChatClient] = useState<StreamChat | null>(null);
	const [connectionFailed, setConnectionFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		const client = new StreamChat(process.env.NEXT_PUBLIC_STREAM_KEY!, {
			timeout: 15_000,
		});

		client
			.connectUser(
				{
					id: user.id,
					username: user.username,
					name: user.displayName,
					image: user.avatarUrl ?? undefined,
				},
				async () =>
					kyInstance
						.get("/api/get-token")
						.json<{ token: string }>()
						.then((data) => data.token),
			)
			.then(() => {
				if (!cancelled) {
					setChatClient(client);
					setConnectionFailed(false);
				}
			})
			.catch((error) => {
				if (!cancelled) {
					console.error("Failed to connect to Stream Chat", error);
					setChatClient(null);
					setConnectionFailed(true);
				}
			});

		return () => {
			cancelled = true;
			setChatClient((current) => (current === client ? null : current));
			void client.disconnectUser().catch((error) => {
				console.error("Failed to disconnect from Stream Chat", error);
			});
		};
	}, [user.id, user.username, user.displayName, user.avatarUrl]);

	return { chatClient, connectionFailed };
}
