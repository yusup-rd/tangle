"use server";

import { endSession, validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export async function logout() {
	const { session } = await validateRequest();

	if (!session) {
		throw new Error("Unauthorized");
	}

	await endSession(session.id);

	return redirect("/login");
}
