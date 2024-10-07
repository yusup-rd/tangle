import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface FollowButtonProps {
	userId: string;
	initialState: FollowerInfo;
}

export default function FollowButton({
	userId,
	initialState,
}: FollowButtonProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { data } = useFollowerInfo(userId, initialState);
}
