import signupImage from "@/assets/signup.jpeg";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GoogleSignInButton from "../GoogleSignInButton";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
	title: "Sign Up",
};

export default function Page() {
	return (
		<main className="flex min-h-dvh items-center justify-center p-4 sm:p-6">
			<div className="relative flex w-full max-w-5xl overflow-hidden rounded-lg bg-card shadow-2xl">
				<div className="flex w-full flex-col justify-center gap-8 p-6 sm:p-10 md:w-1/2">
					<div className="space-y-1 text-center">
						<h1 className="text-3xl leading-tight font-bold tracking-tight">
							Sign Up to{" "}
							<span className="text-primary">Tangle</span>
						</h1>
						<p className="text-muted-foreground">
							Where connections and stories{" "}
							<span className="italic">intertwine</span>
						</p>
					</div>
					<div className="space-y-5">
						<GoogleSignInButton />
						<div className="flex items-center gap-3">
							<div className="h-px flex-1 bg-muted" />
							<span>OR</span>
							<div className="h-px flex-1 bg-muted" />
						</div>
						<SignUpForm />
						<Link
							href="/login"
							className="block text-center hover:underline"
						>
							Already have an account? Log In
						</Link>
					</div>
				</div>
				<Image
					src={signupImage}
					alt=""
					sizes="(min-width: 64rem) 32rem, 50dvw"
					className="absolute inset-y-0 end-0 hidden h-full w-1/2 object-cover md:block"
				/>
			</div>
		</main>
	);
}
