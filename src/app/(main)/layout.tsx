import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = await validateRequest();

	if (!user) redirect("/login");

	return (
		<SessionProvider value={{ user }}>
			<div className="flex min-h-dvh flex-col">
				<Navbar />
				<div className="mx-auto flex w-full max-w-7xl grow gap-5 p-3 sm:p-5">
					<MenuBar className="sticky top-21 hidden h-fit flex-none space-y-3 rounded-lg bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
					{children}
				</div>
				<MenuBar className="sticky bottom-0 z-10 flex w-full items-center justify-evenly gap-1 border-t bg-card px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:hidden" />
			</div>
		</SessionProvider>
	);
}
