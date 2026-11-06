import {
	getGoogleOAuthConfig,
	googleAuthorizationServer,
} from "@/lib/google-oauth";
import { cookies } from "next/headers";
import {
	calculatePKCECodeChallenge,
	generateRandomCodeVerifier,
	generateRandomState,
} from "oauth4webapi";

export async function GET() {
	const { client, redirectUri } = getGoogleOAuthConfig();
	const state = generateRandomState();
	const codeVerifier = generateRandomCodeVerifier();

	const url = new URL(googleAuthorizationServer.authorization_endpoint);
	url.search = new URLSearchParams({
		client_id: client.client_id,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: "profile email",
		state,
		code_challenge: await calculatePKCECodeChallenge(codeVerifier),
		code_challenge_method: "S256",
	}).toString();

	const cookieStore = await cookies();
	cookieStore.set("state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	cookieStore.set("code_verifier", codeVerifier, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	return Response.redirect(url);
}
