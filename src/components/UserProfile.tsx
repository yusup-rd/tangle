import Image from "next/image";
import profilePlaceholder from "@/assets/profile-placeholder.png";
import { cn } from "@/lib/utils";

interface UserProfileProps {
	avatarUrl: string | null | undefined;
	size?: number;
	className?: string;
}

export default function UserProfile({
	avatarUrl,
	size,
	className,
}: UserProfileProps) {
	return (
		<Image
			src={avatarUrl || profilePlaceholder}
			alt="User Profile"
			width={size ?? 48}
			height={size ?? 48}
			className={cn(
				"aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
				className,
			)}
		/>
	);
}
