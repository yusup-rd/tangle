"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useHydrated from "@/hooks/useHydrated";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";

export default function SignUpForm() {
	const hydrated = useHydrated();
	const [error, setError] = useState<string>();

	const [isPending, startTransition] = useTransition();

	const form = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			username: "",
			password: "",
		},
	});

	async function onSubmit(values: SignUpValues) {
		setError(undefined);
		startTransition(async () => {
			const { error } = await signUp(values);
			if (error) setError(error);
		});
	}

	return (
		<Form {...form}>
			<form
				method="post"
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-3"
			>
				{error && (
					<p role="alert" className="text-center text-destructive">
						{error}
					</p>
				)}
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									placeholder="Username"
									autoComplete="username"
									disabled={!hydrated}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									placeholder="Email"
									type="email"
									autoComplete="email"
									disabled={!hydrated}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<PasswordInput
									placeholder="Password"
									autoComplete="new-password"
									disabled={!hydrated}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<LoadingButton
					loading={isPending}
					disabled={!hydrated}
					type="submit"
					className="w-full"
				>
					Create Account
				</LoadingButton>
				<noscript>
					<p className="text-sm text-muted-foreground">
						Enable JavaScript to use this form.
					</p>
				</noscript>
			</form>
		</Form>
	);
}
