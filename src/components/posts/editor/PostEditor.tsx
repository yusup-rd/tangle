"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserProfile from "@/components/UserProfile";
import { useSession } from "@/app/(main)/SessionProvider";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";

export default function PostEditor() {
	const { user } = useSession();

	const mutation = useSubmitPostMutation();

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bold: false,
				italic: false,
			}),
			Placeholder.configure({
				placeholder: "What's in your mind?",
			}),
		],
	});

	const input =
		editor?.getText({
			blockSeparator: "\n",
		}) || "";

	function onSubmit() {
		mutation.mutate(input, {
			onSuccess: () => {
				editor?.commands.clearContent();
			},
		});
		editor?.commands.clearContent();
	}

	return (
		<div className="flex flex-col gap-5 rounded-lg bg-card p-5 shadow-sm">
			<div className="flex gap-5">
				<UserProfile
					avatarUrl={user.avatarUrl}
					className="hidden sm:inline"
				/>
				<EditorContent
					editor={editor}
					className="max-h-[20rem] w-full overflow-y-auto rounded-lg bg-background px-5 py-3"
				/>
			</div>
			<div className="flex justify-end">
				<LoadingButton
					onClick={onSubmit}
					loading={mutation.isPending}
					disabled={!input.trim()}
					className="min-w-20 text-base tracking-wide"
				>
					Post
				</LoadingButton>
			</div>
		</div>
	);
}
