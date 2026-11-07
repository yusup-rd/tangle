import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3100";
const channel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
	testDir: "./e2e",
	use: { baseURL },
	projects: [
		{ name: "desktop", use: { ...devices["Desktop Chrome"], channel } },
		{
			name: "mobile",
			use: {
				...devices["Pixel 7"],
				channel,
				colorScheme: "dark",
				reducedMotion: "reduce",
			},
		},
	],
	webServer: {
		command: "node ./node_modules/next/dist/bin/next start --port 3100",
		url: `${baseURL}/login`,
		env: {
			GOOGLE_CLIENT_ID: "test-client",
			GOOGLE_CLIENT_SECRET: "test-secret",
			NEXT_PUBLIC_BASE_URL: baseURL,
		},
	},
});
