import type { Route } from "./+types/login";

import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "~/lib/auth";

import { FaGithub, FaGoogle } from "react-icons/fa";

import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
	const { data: session, error } = await authClient.getSession();
	if (session) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home page
	}
	return null;
}

const formSchema = z.object({
	username: z.string().nonempty("Username is required"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function Login() {
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		await authClient.signIn.username(
			{
				username: values.username,
				password: values.password,
			},
			{
				onRequest: () => {
					setLoading(true);
				},

				async onSuccess(ctx) {
					if (ctx.data.twoFactorRedirect) {
						navigate("/auth/two-factor"); // Redirect to two-factor page

						return;
					}

					navigate("/settings"); // Redirect to home page
				},

				onError: (ctx) => {
					setError(ctx.error.message);
				},

				onResponse: () => {
					setLoading(false);
				},
			},
		);
	};

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex max-w-lg flex-col gap-6">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-1">
						<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Welcome back!</h1>
						<div className="text-balance text-center text-sm text-neutral-500 dark:text-neutral-400">
							Don&apos;t have an account?
							<Link
								to={{
									pathname: "/auth/onboard",
								}}
								className="ml-1 underline underline-offset-4"
							>
								Sign up
							</Link>
						</div>
					</div>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<div className="text-sm text-red-500 dark:text-red-400">{error}</div>
								</div>
								<div className="flex flex-col gap-2">
									<FormField
										control={form.control}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="text" placeholder="username" required {...field} />
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
												<FormControl>
													<Input type="password" placeholder="password" required {...field} />
												</FormControl>
												<div className="flex items-center justify-end">
													<Link
														to={{
															pathname: "/auth/forgot-password",
														}}
														className="text-xs text-neutral-500 dark:text-neutral-400"
													>
														Forgot password?
													</Link>
												</div>
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
						<span className="relative z-10 bg-sidebar px-2 text-neutral-500 dark:text-neutral-400">Or</span>
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
