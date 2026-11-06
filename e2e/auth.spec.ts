import { expect, test } from "@playwright/test";

test("redirects signed-out users and blocks private APIs", async ({
	page,
	request,
}) => {
	await page.goto("/");
	await expect(page).toHaveURL(/\/login$/);
	await expect(
		page.getByRole("heading", { name: "Log In to Tangle" }),
	).toBeVisible();

	for (const path of [
		"/api/posts/for-you",
		"/api/posts/bookmarked",
		"/api/get-token",
	]) {
		expect((await request.get(path)).status()).toBe(401);
	}
});

test("validates required fields and keeps the password toggle keyboard accessible", async ({
	page,
}) => {
	await page.goto("/login");
	await page.getByRole("button", { name: "Log In", exact: true }).click();
	await expect(page.getByText("Required field.").first()).toBeVisible();

	const password = page.getByLabel("Password", { exact: true });
	await password.fill("Example!123");
	const toggle = page.getByRole("button", { name: "Show password" });
	await toggle.focus();
	await page.keyboard.press("Space");
	await expect(password).toHaveAttribute("type", "text");
	await page.getByRole("button", { name: "Hide password" }).press("Space");
	await expect(password).toHaveAttribute("type", "password");
	await page.getByRole("link", { name: /sign up/i }).click();
	await expect(
		page.getByRole("heading", { name: "Sign Up to Tangle" }),
	).toBeVisible();
});

test("starts Google OAuth with PKCE and rejects a callback with the wrong state", async ({
	request,
}) => {
	const start = await request.get("/login/google", { maxRedirects: 0 });
	expect(start.status()).toBe(302);
	const location = new URL(start.headers().location);
	expect(location.hostname).toBe("accounts.google.com");
	expect(location.searchParams.get("redirect_uri")).toBe(
		"http://localhost:3100/api/auth/callback/google",
	);
	expect(location.searchParams.get("code_challenge_method")).toBe("S256");
	expect(location.searchParams.get("state")).toBeTruthy();
	expect(
		(
			await request.get("/api/auth/callback/google?code=fake&state=wrong")
		).status(),
	).toBe(400);
});
