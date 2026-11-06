import { describe, expect, it } from "vitest";
import {
	createCommentSchema,
	createPostSchema,
	loginSchema,
	signUpSchema,
	updateUserProfileSchema,
} from "./validation";

describe("signUpSchema", () => {
	const validInput = {
		email: "user@example.com",
		username: "cool_user-1",
		password: "Password1!",
	};

	it("accepts valid sign-up data", () => {
		expect(signUpSchema.safeParse(validInput).success).toBe(true);
	});

	it("rejects invalid email addresses", () => {
		const result = signUpSchema.safeParse({
			...validInput,
			email: "not-an-email",
		});
		expect(result.success).toBe(false);
	});

	it("rejects usernames with invalid characters", () => {
		const result = signUpSchema.safeParse({
			...validInput,
			username: "bad user!",
		});
		expect(result.success).toBe(false);
	});

	it("rejects passwords that are too short", () => {
		const result = signUpSchema.safeParse({
			...validInput,
			password: "Pass1!",
		});
		expect(result.success).toBe(false);
	});

	it("rejects passwords missing required character types", () => {
		const result = signUpSchema.safeParse({
			...validInput,
			password: "passwordonly",
		});
		expect(result.success).toBe(false);
	});
});

describe("loginSchema", () => {
	it("accepts non-empty username and password", () => {
		expect(
			loginSchema.safeParse({ username: "user", password: "secret" })
				.success,
		).toBe(true);
	});

	it("rejects empty fields", () => {
		expect(
			loginSchema.safeParse({ username: "", password: "secret" }).success,
		).toBe(false);
		expect(
			loginSchema.safeParse({ username: "user", password: "" }).success,
		).toBe(false);
	});
});

describe("createPostSchema", () => {
	it("accepts content with up to 5 media ids", () => {
		expect(
			createPostSchema.safeParse({
				content: "Hello world",
				mediaIds: ["1", "2", "3", "4", "5"],
			}).success,
		).toBe(true);
	});

	it("rejects more than 5 media ids", () => {
		expect(
			createPostSchema.safeParse({
				content: "Hello world",
				mediaIds: ["1", "2", "3", "4", "5", "6"],
			}).success,
		).toBe(false);
	});

	it("rejects empty content", () => {
		expect(
			createPostSchema.safeParse({ content: "   ", mediaIds: [] })
				.success,
		).toBe(false);
	});
});

describe("updateUserProfileSchema", () => {
	it("accepts valid profile updates", () => {
		expect(
			updateUserProfileSchema.safeParse({
				displayName: "Jane Doe",
				bio: "Software developer",
			}).success,
		).toBe(true);
	});

	it("rejects bios longer than 800 characters", () => {
		expect(
			updateUserProfileSchema.safeParse({
				displayName: "Jane Doe",
				bio: "a".repeat(801),
			}).success,
		).toBe(false);
	});
});

describe("createCommentSchema", () => {
	it("accepts non-empty comment content", () => {
		expect(
			createCommentSchema.safeParse({ content: "Nice post!" }).success,
		).toBe(true);
	});

	it("rejects empty comment content", () => {
		expect(createCommentSchema.safeParse({ content: "  " }).success).toBe(
			false,
		);
	});
});
