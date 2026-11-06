import prisma from "@/lib/prisma";
import { getUploadThingFileKey } from "@/lib/uploadthing-files";
import { UTApi } from "uploadthing/server";

export async function GET(req: Request) {
	try {
		const authHeader = req.headers.get("Authorization");

		const secret = process.env.CRON_SECRET;
		if (!secret || authHeader !== `Bearer ${secret}`) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const unusedMedia = await prisma.media.findMany({
			where: {
				postId: null,
				createdAt: {
					lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
				},
			},
			select: {
				id: true,
				url: true,
			},
		});

		const files = unusedMedia.flatMap(({ id, url }) => {
			const key = getUploadThingFileKey(url);
			return key ? [{ id, key }] : [];
		});
		if (!files.length) return new Response(null, { status: 204 });

		const result = await new UTApi().deleteFiles(
			files.map(({ key }) => key),
		);
		if (!result.success)
			throw new Error("UploadThing could not delete unused files");

		await prisma.media.deleteMany({
			where: { postId: null, id: { in: files.map(({ id }) => id) } },
		});

		return new Response(null, { status: 204 });
	} catch (error) {
		console.error(error);
		return Response.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
