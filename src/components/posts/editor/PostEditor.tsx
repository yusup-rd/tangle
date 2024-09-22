"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "./actions";
import UserProfile from "@/components/UserProfile";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import "./styles.css";

export default function PostEditor() {
	const { user } = useSession();

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

	async function onSubmit() {
		await submitPost(input);
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
					className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3"
				/>
			</div>
			<div className="flex justify-end">
				<Button
					onClick={onSubmit}
					disabled={!input.trim()}
					className="min-w-20 tracking-wide text-base"
				>
					Post
				</Button>
			</div>
		</div>
	);
}
