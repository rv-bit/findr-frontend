import type { Route } from "./+types/login";

import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "~/lib/auth";

import * as constants from "~/constants/default";

import { FaGithub, FaGoogle } from "react-icons/fa";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";

export async function clientLoader() {
	const { data: session, error } = await authClient.getSession();
	console.log("session", session);
	if (session) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}
	return null;
}

const formSchema = z.object({
	email: z.string().email().nonempty("Email is required"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function Login() {
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		await authClient.signIn.email(
			{
				email: values.email,
				password: values.password,
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onSuccess: () => {
					setLoading(false);
					navigate("/"); // Redirect to home page
				},
				onError: (ctx) => {
					setLoading(false);
					setError(ctx.error.message);
				},
			},
		);
	};

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex max-w-lg flex-col gap-6">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-1">
						<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Welcome to {constants.APP_NAME}</h1>
						<div className="text-balance text-center text-sm text-neutral-500 dark:text-neutral-400">
							Don&apos;t have an account?
							<Link
								to={{
									pathname: "/onboard",
								}}
								className="ml-1 underline underline-offset-4"
							>
								Sign up
							</Link>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)}>
							<div className="mb-2 flex flex-col gap-2">
								<div className="text-sm text-red-500 dark:text-red-400">{error}</div>
							</div>

							<div className="flex flex-col gap-6">
								<div className="flex flex-col gap-2">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input type="email" placeholder="m@example.com" required {...field} />
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
													<Input type="password" required {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? "Loading..." : "Continue"}
								</Button>
							</div>
						</form>
					</Form>

					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-neutral-200 dark:after:border-neutral-800">
						<span className="relative z-10 bg-white px-2 text-neutral-500 dark:bg-primary dark:text-neutral-400">Or</span>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<Button
							onClick={() => {
								authClient.signIn.social({
									provider: "github",
									callbackURL: window.location.origin + "/", // Redirect to home page
								});
							}}
							variant="outline"
							className="w-full text-neutral-500 dark:text-neutral-400"
						>
							<FaGithub />
							Continue with GitHub
						</Button>
						<Button
							onClick={() => {
								authClient.signIn.social({
									provider: "google",
									callbackURL: window.location.origin + "/", // Redirect to home page
								});
							}}
							variant="outline"
							className="w-full text-neutral-500 dark:text-neutral-400"
						>
							<FaGoogle />
							Continue with Google
						</Button>
					</div>
				</div>
				<div className="text-balance text-center text-xs text-neutral-500 dark:text-neutral-400 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-neutral-900 dark:hover:[&_a]:text-neutral-50">
					By clicking continue, you agree to our <Link to={{ pathname: "/legal" }}>Terms of Service</Link> and <Link to={{ pathname: "/legal" }}>Privacy Policy</Link>.
				</div>
			</div>
		</div>
	);
}
