import { PrismaClient } from "@/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const getConnectionString = (connectionString: string | undefined) => {
	if (!connectionString) return connectionString;

	const url = URL.parse(connectionString);
	if (!url || url.searchParams.getAll("uselibpqcompat").at(-1) === "true") {
		return connectionString;
	}

	// Preserve pg's current certificate and hostname checks across upgrades.
	const sslMode = url.searchParams.getAll("sslmode").at(-1);
	if (
		sslMode !== "prefer" &&
		sslMode !== "require" &&
		sslMode !== "verify-ca"
	) {
		return connectionString;
	}

	url.searchParams.set("sslmode", "verify-full");
	return url.toString();
};

const prismaClientSingleton = () => {
	return new PrismaClient({
		adapter: new PrismaPg({
			connectionString: getConnectionString(
				process.env.POSTGRES_PRISMA_URL,
			),
		}),
	});
};

declare global {
	var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
