"use client";

import type { SessionUser } from "@/auth";
import React, { createContext, useContext } from "react";

interface SessionContext {
	user: SessionUser;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
	children,
	value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
	return (
		<SessionContext.Provider value={value}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession must be used within SessionProvider");
	}
	return context;
}
