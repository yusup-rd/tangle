import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import SearchResults from "./SearchResults";

interface PageProps {
	searchParams: Promise<{ q?: string | string[] }>;
}

const getQuery = (q: string | string[] | undefined) =>
	(Array.isArray(q) ? q[0] : q)?.trim() ?? "";

export async function generateMetadata({
	searchParams,
}: PageProps): Promise<Metadata> {
	const { q } = await searchParams;
	return {
		title: `Search results for "${getQuery(q)}"`,
	};
}

export default async function Page({ searchParams }: PageProps) {
	const { q } = await searchParams;
	const query = getQuery(q);
	return (
		<main className="flex w-full min-w-0 gap-5">
			<div className="w-full min-w-0 space-y-5">
				<div className="rounded-2xl bg-card p-5 shadow-sm">
					<h1 className="line-clamp-2 text-center text-2xl font-bold break-all">
						Search results for &quot;{query}&quot;
					</h1>
				</div>
				<SearchResults query={query} />
			</div>
			<TrendsSidebar />
		</main>
	);
}
