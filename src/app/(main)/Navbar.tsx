import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";

export default function Navbar() {
	return (
		<header
			data-app-navbar
			className="sticky top-0 z-10 bg-card/95 shadow-sm supports-backdrop-filter:backdrop-blur-md contrast-more:bg-card"
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:gap-5 sm:px-5 sm:py-3">
				<Link
					href="/"
					className="text-2xl font-bold tracking-tight text-primary"
				>
					Tangle
				</Link>
				<SearchField />
				<UserButton className="sm:ms-auto" />
			</div>
		</header>
	);
}
