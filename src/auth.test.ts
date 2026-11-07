import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { endSession, startSession, validateRequest } from "./auth";

const { store, sessions } = vi.hoisted(() => ({
	store: { get: vi.fn(), set: vi.fn() },
	sessions: {
		create: vi.fn(),
		deleteMany: vi.fn(),
		findUnique: vi.fn(),
		updateMany: vi.fn(),
	},
}));

vi.mock("next/headers", () => ({ cookies: async () => store }));
vi.mock("./lib/prisma", () => ({ default: { session: sessions } }));

const user = {
	id: "user-1",
	username: "tangle",
	displayName: "Tangle",
	avatarUrl: null,
};

describe("authentication sessions", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
	});
	afterEach(() => vi.useRealTimers());

	it("stores the token hash and issues an HttpOnly browser-session cookie", async () => {
		await startSession(user.id);
		const [name, token, options] = store.set.mock.calls[0];
		expect(name).toBe("auth_session");
		expect(options).toMatchObject({
			httpOnly: true,
			sameSite: "lax",
			path: "/",
		});
		expect(options).not.toHaveProperty("maxAge");
		expect(options).not.toHaveProperty("expires");
		expect(sessions.create).toHaveBeenCalledWith({
			data: {
				id: createHash("sha256").update(token).digest("hex"),
				userId: user.id,
				expiresAt: new Date("2026-01-31T00:00:00Z"),
			},
		});
	});

	it("rejects malformed cookies without querying the database", async () => {
		store.get.mockReturnValue({ value: "invalid" });
		await expect(validateRequest()).resolves.toEqual({
			user: null,
			session: null,
		});
		expect(sessions.findUnique).not.toHaveBeenCalled();
	});

	it("accepts existing unexpired Lucia sessions", async () => {
		const id = "a".repeat(40);
		const expiresAt = new Date("2026-01-04T00:00:00Z");
		store.get.mockReturnValue({ value: id });
		sessions.findUnique.mockResolvedValue({
			id,
			expiresAt,
			userId: user.id,
			user,
		});

		await expect(validateRequest()).resolves.toEqual({
			user,
			session: { id, expiresAt, userId: user.id },
		});
		expect(sessions.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id } }),
		);
		expect(sessions.updateMany).not.toHaveBeenCalled();
	});

	it("renews a current session inside the second half of its lifetime", async () => {
		const token = "b".repeat(43);
		const id = createHash("sha256").update(token).digest("hex");
		const expiresAt = new Date("2026-01-10T00:00:00Z");
		const renewedExpiry = new Date("2026-01-31T00:00:00Z");
		store.get.mockReturnValue({ value: token });
		sessions.findUnique.mockResolvedValue({
			id,
			expiresAt,
			userId: user.id,
			user,
		});
		sessions.updateMany.mockResolvedValue({ count: 1 });

		await expect(validateRequest()).resolves.toEqual({
			user,
			session: { id, expiresAt: renewedExpiry, userId: user.id },
		});
		expect(sessions.updateMany).toHaveBeenCalledWith({
			where: { id, expiresAt: { gt: new Date(), lt: renewedExpiry } },
			data: { expiresAt: renewedExpiry },
		});
	});

	it("rejects and removes expired sessions", async () => {
		const token = "b".repeat(43);
		const id = createHash("sha256").update(token).digest("hex");
		store.get.mockReturnValue({ value: token });
		sessions.findUnique.mockResolvedValue({
			id,
			expiresAt: new Date(),
			userId: user.id,
			user,
		});

		await expect(validateRequest()).resolves.toEqual({
			user: null,
			session: null,
		});
		expect(sessions.deleteMany).toHaveBeenCalledWith({
			where: { id, expiresAt: { lte: new Date() } },
		});
	});

	it("invalidates the session and clears its cookie on logout", async () => {
		await endSession("stored-id");
		expect(sessions.deleteMany).toHaveBeenCalledWith({
			where: { id: "stored-id" },
		});
		expect(store.set).toHaveBeenCalledWith(
			"auth_session",
			"",
			expect.objectContaining({ maxAge: 0 }),
		);
	});
});
