"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserProfile from "./UserProfile";

interface UserButtonProps {
	className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
	const { user } = useSession();
	const { theme, setTheme } = useTheme();
	const queryClient = useQueryClient();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Account menu"
					className={cn(
						"grid size-11 shrink-0 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-ring",
						className,
					)}
				>
					<UserProfile avatarUrl={user.avatarUrl} size={40} />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				collisionPadding={12}
				className="max-h-(--radix-dropdown-menu-content-available-height) max-w-(--radix-dropdown-menu-content-available-width) overflow-y-auto"
			>
				<DropdownMenuLabel className="truncate">
					Logged in as @{user.username}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href={`/users/${user.username}`}>
						<UserIcon className="mr-2 size-4" />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup
					aria-label="Theme"
					value={theme}
					onValueChange={setTheme}
				>
					<DropdownMenuLabel>Theme</DropdownMenuLabel>
					<DropdownMenuRadioItem value="system">
						System default
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="light">
						Light
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">
						Dark
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						queryClient.clear();
						logout();
					}}
				>
					<LogOutIcon className="mr-2 size-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
