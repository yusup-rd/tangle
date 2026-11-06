import type { Session, User } from "@/generated/prisma/client";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import prisma from "./lib/prisma";

const sessionCookieName = "auth_session";
const sessionLifetime = 30 * 24 * 60 * 60 * 1000;
const cookieOptions = {
	httpOnly: true,
	path: "/",
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
} as const;
const anonymous = { user: null, session: null };

export type SessionUser = Pick<
	User,
	"id" | "username" | "displayName" | "avatarUrl"
>;

const hashToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

export const startSession = async (userId: string) => {
	const token = randomBytes(32).toString("base64url");
	await prisma.session.create({
		data: {
			id: hashToken(token),
			userId,
			expiresAt: new Date(Date.now() + sessionLifetime),
		},
	});
	(await cookies()).set(sessionCookieName, token, cookieOptions);
};

export const endSession = async (id: string) => {
	await prisma.session.deleteMany({ where: { id } });
	(await cookies()).set(sessionCookieName, "", {
		...cookieOptions,
		maxAge: 0,
	});
};

export const validateRequest = cache(
	async (): Promise<
		{ user: SessionUser; session: Session } | typeof anonymous
	> => {
		const token = (await cookies()).get(sessionCookieName)?.value;
		if (!token) return anonymous;

		// Lucia stored 40-character base32 tokens directly. Honor those sessions until they expire.
		const legacyToken = /^[a-z2-7]{40}$/.test(token);
		if (!legacyToken && !/^[\w-]{43}$/.test(token)) return anonymous;
		const id = legacyToken ? token : hashToken(token);
		const result = await prisma.session.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						username: true,
						displayName: true,
						avatarUrl: true,
					},
				},
			},
		});
		if (!result) return anonymous;

		const { user, ...session } = result;
		const now = Date.now();
		if (session.expiresAt.getTime() <= now) {
			await prisma.session.deleteMany({
				where: { id, expiresAt: { lte: new Date(now) } },
			});
			return anonymous;
		}

		if (
			!legacyToken &&
			session.expiresAt.getTime() - now <= sessionLifetime / 2
		) {
			const expiresAt = new Date(now + sessionLifetime);
			const renewed = await prisma.session.updateMany({
				where: { id, expiresAt: { gt: new Date(now), lt: expiresAt } },
				data: { expiresAt },
			});
			if (renewed.count) session.expiresAt = expiresAt;
		}

		return { user, session };
	},
);
