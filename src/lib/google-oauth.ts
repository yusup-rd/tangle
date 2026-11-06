export const googleAuthorizationServer = {
	issuer: "https://accounts.google.com",
	authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
	token_endpoint: "https://oauth2.googleapis.com/token",
};

export const getGoogleOAuthConfig = () => {
	const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_BASE_URL } =
		process.env;
	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXT_PUBLIC_BASE_URL) {
		throw new Error("Google OAuth configuration is incomplete");
	}
	return {
		client: { client_id: GOOGLE_CLIENT_ID },
		clientSecret: GOOGLE_CLIENT_SECRET,
		redirectUri: new URL("/api/auth/callback/google", NEXT_PUBLIC_BASE_URL)
			.href,
	};
};
