import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUploadThingFileKey } from "@/lib/uploadthing-files";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
	avatar: f({
		image: { maxFileSize: "512KB" },
	})
		.middleware(async () => {
			const { user } = await validateRequest();

			if (!user)
				throw new UploadThingError({
					code: "FORBIDDEN",
					message: "Unauthorized",
				});

			return { user };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			const oldAvatarUrl = metadata.user.avatarUrl;

			const newAvatarUrl = file.ufsUrl;
			await prisma.user.update({
				where: { id: metadata.user.id },
				data: { avatarUrl: newAvatarUrl },
			});
			await streamServerClient
				.partialUpdateUser({
					id: metadata.user.id,
					set: { image: newAvatarUrl },
				})
				.catch((error) => {
					console.error(
						"Could not sync the avatar to Stream Chat",
						error,
					);
				});

			const oldKey = oldAvatarUrl && getUploadThingFileKey(oldAvatarUrl);
			if (oldKey && oldKey !== file.key) {
				await new UTApi().deleteFiles(oldKey).catch((error) => {
					console.error(
						"Could not delete the previous avatar",
						error,
					);
				});
			}

			return { avatarUrl: newAvatarUrl };
		}),
	attachment: f({
		image: { maxFileSize: "4MB", maxFileCount: 5 },
		video: { maxFileSize: "64MB", maxFileCount: 5 },
	})
		.middleware(async () => {
			const { user } = await validateRequest();

			if (!user)
				throw new UploadThingError({
					code: "FORBIDDEN",
					message: "Unauthorized",
				});

			return {};
		})
		.onUploadComplete(async ({ file }) => {
			const media = await prisma.media.create({
				data: {
					url: file.ufsUrl,
					type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
				},
			});

			return { mediaId: media.id };
		}),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
