import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { findMany, deleteMany, deleteFiles } = vi.hoisted(() => ({
	findMany: vi.fn(),
	deleteMany: vi.fn(),
	deleteFiles: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
	default: { media: { findMany, deleteMany } },
}));
vi.mock("uploadthing/server", () => ({
	UTApi: class {
		deleteFiles = deleteFiles;
	},
}));

const request = (secret: string) =>
	new Request("http://localhost/api/clear-uploads", {
		headers: { Authorization: `Bearer ${secret}` },
	});

describe("orphaned upload cleanup", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.stubEnv("CRON_SECRET", "test-secret");
		vi.stubEnv("NEXT_PUBLIC_UPLOADTHING_APP_ID", "test-app");
	});
	afterEach(() => vi.unstubAllEnvs());

	it("fails closed when the cron secret is unset", async () => {
		vi.stubEnv("CRON_SECRET", undefined);
		expect((await GET(request("undefined"))).status).toBe(401);
		expect(findMany).not.toHaveBeenCalled();
	});

	it("rejects an incorrect bearer before querying the database", async () => {
		expect((await GET(request("incorrect"))).status).toBe(401);
		expect(findMany).not.toHaveBeenCalled();
	});

	it("cleans up old and new URLs for this app and ignores other hosts", async () => {
		findMany.mockResolvedValue([
			{ id: "1", url: "https://utfs.io/a/test-app/old-key" },
			{ id: "2", url: "https://test-app.ufs.sh/f/new-key" },
			{ id: "3", url: "https://other-app.ufs.sh/f/other-key" },
		]);
		deleteFiles.mockResolvedValue({ success: true });

		expect((await GET(request("test-secret"))).status).toBe(204);
		expect(deleteFiles).toHaveBeenCalledWith(["old-key", "new-key"]);
		expect(deleteMany).toHaveBeenCalledWith({
			where: { postId: null, id: { in: ["1", "2"] } },
		});
	});

	it("keeps database records if UploadThing reports a failure", async () => {
		findMany.mockResolvedValue([
			{ id: "1", url: "https://test-app.ufs.sh/f/key" },
		]);
		deleteFiles.mockResolvedValue({ success: false });
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			expect((await GET(request("test-secret"))).status).toBe(500);
			expect(deleteMany).not.toHaveBeenCalled();
		} finally {
			log.mockRestore();
		}
	});
});
