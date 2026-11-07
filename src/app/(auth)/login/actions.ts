"use server";

import { startSession } from "@/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { verify } from "@node-rs/argon2";
import { redirect } from "next/navigation";

export async function login(
	credentials: LoginValues,
): Promise<{ error: string }> {
	try {
		const { username, password } = loginSchema.parse(credentials);

		const existingUser = await prisma.user.findFirst({
			where: {
				username: {
					equals: username,
					mode: "insensitive",
				},
			},
		});

		if (!existingUser || !existingUser.passwordHash) {
			return {
				error: "Incorrect username or password",
			};
		}

		const validPassword = await verify(
			existingUser.passwordHash,
			password,
			{
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1,
			},
		);

		if (!validPassword) {
			return {
				error: "Incorrect username or password",
			};
		}

		await startSession(existingUser.id);
	} catch (error) {
		console.error(error);

		return { error: "Something went wrong. Please try again." };
	}

	redirect("/");
}
