import { useToast } from "@/components/ui/use-toast";
import { uploadFiles } from "@/lib/uploadthing";
import { useEffect, useRef, useState } from "react";

const callbackTimeoutMs = 60_000;

export interface Attachment {
	file: File;
	previewUrl: string;
	mediaId?: string;
}

export default function useMediaUpload() {
	const { toast } = useToast();
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [uploadProgress, setUploadProgress] = useState<number>();
	const activeUpload = useRef<AbortController | null>(null);
	const previewUrls = useRef(new Map<string, string>());

	useEffect(() => {
		const urls = previewUrls.current;
		return () => {
			activeUpload.current?.abort();
			for (const url of urls.values()) URL.revokeObjectURL(url);
			urls.clear();
		};
	}, []);

	function releasePreview(filename: string) {
		const url = previewUrls.current.get(filename);
		if (url) URL.revokeObjectURL(url);
		previewUrls.current.delete(filename);
	}

	async function startUpload(files: File[]) {
		if (!files.length || activeUpload.current) return;

		if (previewUrls.current.size + files.length > 5) {
			toast({
				variant: "destructive",
				description: "You can only upload up to 5 files.",
			});
			return;
		}

		const controller = new AbortController();
		activeUpload.current = controller;
		let callbackTimer: ReturnType<typeof setTimeout> | undefined;
		let callbackTimedOut = false;

		const batch = files.map((original) => {
			const extension = original.name.match(/\.[^.]+$/)?.[0] ?? "";
			const file = new File(
				[original],
				`attachment_${crypto.randomUUID()}${extension}`,
				{ type: original.type },
			);
			const previewUrl = URL.createObjectURL(file);
			previewUrls.current.set(file.name, previewUrl);
			return { file, previewUrl };
		});
		const batchNames = new Set(batch.map(({ file }) => file.name));
		const totalBytes = batch.reduce(
			(total, { file }) => total + file.size,
			0,
		);
		const uploadedBytesByFile = new Map<File, number>();
		setAttachments((previous) => [...previous, ...batch]);
		setUploadProgress(0);

		try {
			const results = await uploadFiles("attachment", {
				files: batch.map(({ file }) => file),
				signal: controller.signal,
				onUploadProgress: ({ file, loaded }) => {
					uploadedBytesByFile.set(file, Math.min(file.size, loaded));
					const uploadedBytes = [
						...uploadedBytesByFile.values(),
					].reduce((total, bytes) => total + bytes, 0);
					setUploadProgress(
						Math.floor((uploadedBytes / (totalBytes || 1)) * 100),
					);
					if (
						uploadedBytes < totalBytes ||
						callbackTimer !== undefined
					)
						return;
					callbackTimer = setTimeout(() => {
						callbackTimedOut = true;
						controller.abort();
					}, callbackTimeoutMs);
				},
			});

			const mediaIds = new Map<string, string>();
			for (const { name, serverData } of results) {
				if (
					typeof serverData?.mediaId === "string" &&
					serverData.mediaId
				) {
					mediaIds.set(name, serverData.mediaId);
				}
			}

			for (const name of batchNames) {
				if (!mediaIds.has(name)) releasePreview(name);
			}
			setAttachments((previous) =>
				previous.flatMap((attachment) => {
					const name = attachment.file.name;
					if (!batchNames.has(name)) return [attachment];
					const mediaId = mediaIds.get(name);
					return mediaId ? [{ ...attachment, mediaId }] : [];
				}),
			);
			if (batch.some(({ file }) => !mediaIds.has(file.name))) {
				toast({
					variant: "destructive",
					description:
						"Some attachments could not be saved. Please try again.",
				});
			}
		} catch (error) {
			if (controller.signal.aborted && !callbackTimedOut) return;
			for (const name of batchNames) releasePreview(name);
			setAttachments((previous) =>
				previous.filter(({ file }) => !batchNames.has(file.name)),
			);
			toast({
				variant: "destructive",
				description: callbackTimedOut
					? "The upload took too long to finish. Please try again."
					: error instanceof Error
						? error.message
						: "The upload failed. Please try again.",
			});
		} finally {
			clearTimeout(callbackTimer);
			activeUpload.current = null;
			setUploadProgress(undefined);
		}
	}

	function removeAttachment(filename: string) {
		releasePreview(filename);
		setAttachments((previous) =>
			previous.filter(({ file }) => file.name !== filename),
		);
	}

	function reset() {
		for (const filename of previewUrls.current.keys())
			releasePreview(filename);
		setAttachments([]);
	}

	return {
		startUpload,
		attachments,
		isUploading: uploadProgress !== undefined,
		uploadProgress,
		removeAttachment,
		reset,
	};
}
