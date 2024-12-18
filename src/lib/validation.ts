import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required field.");

export const signUpSchema = z.object({
	email: requiredString.email("Invalid email address."),
	username: requiredString.regex(
		/^[a-zA-Z0-9_-]+$/,
		"Username can only contain letters, numbers, underscores, and hyphens.",
	),
	password: requiredString
		.min(8, "Password must be at least 8 characters long")
		.regex(
			/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
			"Password must contain at least one letter, one number, and one special character.",
		),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
	username: requiredString,
	password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
	content: requiredString,
	mediaIds: z.array(z.string()).max(5, "You can only upload up to 5 files."),
});

export const updateUserProfileSchema = z.object({
	displayName: requiredString,
	bio: z.string().max(800, "Bio must be 800 characters or less."),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
	content: requiredString,
});