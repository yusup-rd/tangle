import { startSession } from "@/auth";
import {
	getGoogleOAuthConfig,
	googleAuthorizationServer,
} from "@/lib/google-oauth";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import {
	authorizationCodeGrantRequest,
	ClientSecretPost,
	processAuthorizationCodeResponse,
	validateAuthResponse,
} from "oauth4webapi";

export async function GET(req: NextRequest) {
	const cookieStore = await cookies();
	const storedState = cookieStore.get("state")?.value;
	const storedCodeVerifier = cookieStore.get("code_verifier")?.value;

	if (!storedState || !storedCodeVerifier) {
		return new Response(null, { status: 400 });
	}

	const { client, clientSecret, redirectUri } = getGoogleOAuthConfig();
	let params: URLSearchParams;
	try {
		params = validateAuthResponse(
			googleAuthorizationServer,
			client,
			req.nextUrl.searchParams,
			storedState,
		);
	} catch {
		return new Response(null, { status: 400 });
	}

	if (!params.has("code")) return new Response(null, { status: 400 });

	cookieStore.delete("state");
	cookieStore.delete("code_verifier");

	let accessToken: string;
	try {
		const response = await authorizationCodeGrantRequest(
			googleAuthorizationServer,
			client,
			ClientSecretPost(clientSecret),
			params,
			redirectUri,
			storedCodeVerifier,
		);
		const tokens = await processAuthorizationCodeResponse(
			googleAuthorizationServer,
			client,
			response,
		);
		accessToken = tokens.access_token;
	} catch {
		return new Response(null, { status: 502 });
	}

	try {
		const googleUser = await kyInstance
			.get("https://www.googleapis.com/oauth2/v1/userinfo", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.json<{ id: string; name: string }>();

		const existingUser = await prisma.user.findUnique({
			where: {
				googleId: googleUser.id,
			},
		});

		if (existingUser) {
			await startSession(existingUser.id);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/",
				},
			});
		}

		const userId = randomBytes(10).toString("hex");

		const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

		await prisma.$transaction(async (tx) => {
			await tx.user.create({
				data: {
					id: userId,
					username,
					displayName: googleUser.name,
					googleId: googleUser.id,
				},
			});
			await streamServerClient.upsertUser({
				id: userId,
				username,
				name: username,
			});
		});

		await startSession(userId);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/",
			},
		});
	} catch (error) {
		console.error(
			"Google sign-in failed",
			error instanceof Error ? error.name : "unknown error",
		);
		return new Response(null, {
			status: 500,
		});
	}
}
