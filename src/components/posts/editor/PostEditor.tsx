"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserProfile from "@/components/UserProfile";
import { useSession } from "@/app/(main)/SessionProvider";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import useMediaUpload, { Attachment } from "./useMediaUpload";
import { useRef } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function PostEditor() {
	const { user } = useSession();

	const mutation = useSubmitPostMutation();

	const {
		startUpload,
		attachments,
		isUploading,
		uploadProgress,
		removeAttachment,
		reset: resetMediaUploads,
	} = useMediaUpload();

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
		mutation.mutate(
			{
				content: input,
				mediaIds: attachments
					.map((attachment) => attachment.mediaId)
					.filter(Boolean) as string[],
			},
			{
				onSuccess: () => {
					editor?.commands.clearContent();
					resetMediaUploads();
				},
			},
		);
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
			{!!attachments.length && (
				<AttachmentPreviews
					attachments={attachments}
					onRemoveAttachment={removeAttachment}
				/>
			)}
			<div className="flex items-center justify-end gap-3">
				{isUploading && (
					<>
						<span className="text-sm">{uploadProgress ?? 0}%</span>
						<Loader2 className="size-5 animate-spin text-primary" />
					</>
				)}
				<AddAttachmentsButton
					onSelectFiles={startUpload}
					disabled={isUploading || attachments.length >= 5}
				/>
				<LoadingButton
					onClick={onSubmit}
					loading={mutation.isPending}
					disabled={!input.trim() || isUploading}
					className="min-w-20 text-base tracking-wide"
				>
					Post
				</LoadingButton>
			</div>
		</div>
	);
}

interface AddAttachmentsButtonProps {
	onSelectFiles: (files: File[]) => void;
	disabled: boolean;
}

function AddAttachmentsButton({
	onSelectFiles,
	disabled,
}: AddAttachmentsButtonProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="text-primary hover:text-primary"
				onClick={() => fileInputRef.current?.click()}
				disabled={disabled}
			>
				<ImageIcon size={20} />
			</Button>
			<input
				type="file"
				accept="image/*, video/*"
				ref={fileInputRef}
				className="sr-only hidden"
				multiple
				onChange={(e) => {
					const files = Array.from(e.target.files || []);
					if (files.length) {
						onSelectFiles(files);
						e.target.value = "";
					}
				}}
			/>
		</>
	);
}

interface AttachmentPreviewsProps {
	attachments: Attachment[];
	onRemoveAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
	attachments,
	onRemoveAttachment,
}: AttachmentPreviewsProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-3",
				attachments.length > 1 && "sm:grid sm:grid-cols-2",
			)}
		>
			{attachments.map((attachment) => (
				<AttachmentPreview
					key={attachment.file.name}
					attachment={attachment}
					onRemoveClick={() =>
						onRemoveAttachment(attachment.file.name)
					}
				/>
			))}
		</div>
	);
}

interface AttachmentPreviewProps {
	attachment: Attachment;
	onRemoveClick: () => void;
}

function AttachmentPreview({
	attachment: { file, mediaId, isUploading },
	onRemoveClick,
}: AttachmentPreviewProps) {
	const src = URL.createObjectURL(file);

	return (
		<div
			className={cn(
				"relative mx-auto size-fit",
				isUploading && "opacity-50",
			)}
		>
			{file.type.startsWith("image") ? (
				<Image
					src={src}
					alt="Attachment preview"
					width={500}
					height={500}
					className="size-fit max-h-[30rem] rounded-lg"
				/>
			) : (
				<video controls className="size-fit max-h-[30rem] rounded-lg">
					<source src={src} type={file.type} />
				</video>
			)}
			{!isUploading && (
				<button
					onClick={onRemoveClick}
					className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
				>
					<X size={20} />
				</button>
			)}
		</div>
	);
}
