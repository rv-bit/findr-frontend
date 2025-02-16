import React from "react";
import type { Route } from "./+types/onboard";

import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import * as constants from "~/constants/app";

import { useSession } from "~/hooks/use-auth";

import { authClient, type Session } from "~/lib/auth";
import { prefetchSession } from "~/lib/auth-prefetches";
import { queryClient } from "~/lib/query/query-client";
import { cn } from "~/lib/utils";

import { Eye, EyeOff } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";

import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { getPasswordStrength, strengthVariants } from "~/styles/variants/password-variants";

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
	const cachedData = queryClient.getQueryData<Session>(["session"]);
	const data = cachedData ?? (await prefetchSession(queryClient));

	const session = {
		session: data.session,
		user: data.user,
	};

	if (session.session || session.user) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home page
	}

	return null;
}

const formSchema = z
	.object({
		email: z.string().email().nonempty("Email is required"),
		name: z.string().nonempty("Name is required"),
		username: z.string().nonempty("Username is required"),
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string(),
	})
	.refine((data) => !data.username.includes("@"), {
		message: "Username cannot contain '@'",
		path: ["username"],
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export default function Register() {
	const navigate = useNavigate();
	const { refetch } = useSession();

	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string>();

	const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			name: "",
			username: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		await authClient.signUp.email(
			{
				email: values.email,
				name: values.name,
				username: values.username,
				password: values.password,
				callbackURL: "/auth/verify-email",
				about_description: "",
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onSuccess: async () => {
					await refetch(); // Refetch session, because the user is now signed in, as its automatically done after sign up

					setLoading(false);
					navigate("/"); // Redirect to home page
				},
				onError: (error) => {
					setLoading(false);
					setError(error.error.message);
				},
			},
		);
	};

	function handlePasswordVisibilityToggle(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		setIsPasswordVisible(!isPasswordVisible);
	}

	const passwordStrength = React.useMemo(() => {
		const value = form.watch("password");
		const score = getPasswordStrength(value?.toString() ?? "");

		return strengthVariants[score as keyof typeof strengthVariants];
	}, [form.watch]);

	const passwordConfirmStrength = React.useMemo(() => {
		const value = form.watch("confirmPassword");
		const score = getPasswordStrength(value?.toString() ?? "");

		return strengthVariants[score as keyof typeof strengthVariants];
	}, [form.watch]);

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex max-w-lg flex-col gap-6">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-1">
						<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Welcome to {constants.APP_NAME}</h1>
						<div className="text-center text-sm text-balance text-neutral-500 dark:text-neutral-400">
							Already have an account?
							<Link
								to={{
									pathname: "/auth",
								}}
								className="ml-1 underline underline-offset-4"
							>
								Sign in
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
												<FormControl>
													<Input type="email" placeholder="name@example.com" required className="text-black dark:text-white" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="text" placeholder="name" required className="text-black dark:text-white" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input type="text" placeholder="username" required className="text-black dark:text-white" {...field} />
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
												<FormLabel>
													<motion.div
														key={passwordStrength.verdict}
														initial={{ opacity: 0, y: 10, scale: 0.9 }}
														animate={{ opacity: 1, y: 0, scale: 1 }}
														exit={{ opacity: 0, y: -10, scale: 0.9 }}
														transition={{ type: "spring", stiffness: 500, damping: 30 }}
														className={cn(`text-muted-foreground mb-1.5 h-4 text-right text-xs ${form.watch("password").length > 0 ? "block" : "hidden"}`)}
													>
														{passwordStrength.verdict}
													</motion.div>
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={isPasswordVisible ? "text" : "password"}
															placeholder="password"
															required
															className={cn("pe-9 text-black duration-350 dark:text-white", passwordStrength.styles)}
															{...field}
														/>
														<Button
															className="text-muted-foreground absolute inset-y-0 end-0"
															onClick={handlePasswordVisibilityToggle}
															aria-hidden="true"
															variant="link"
															tabIndex={-1}
															type="button"
															size="icon"
														>
															{isPasswordVisible ? <EyeOff className="size-4" strokeWidth={2} /> : <Eye className="size-4" strokeWidth={2} />}
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													<motion.div
														key={passwordConfirmStrength.verdict}
														initial={{ opacity: 0, y: 10, scale: 0.9 }}
														animate={{ opacity: 1, y: 0, scale: 1 }}
														exit={{ opacity: 0, y: -10, scale: 0.9 }}
														transition={{ type: "spring", stiffness: 500, damping: 30 }}
														className={cn(`text-muted-foreground mb-1.5 h-4 text-right text-xs ${form.watch("confirmPassword").length > 0 ? "block" : "hidden"}`)}
													>
														{passwordConfirmStrength.verdict}
													</motion.div>
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={isPasswordVisible ? "text" : "password"}
															placeholder="confirm password"
															required
															className={cn("pe-9 text-black duration-350 dark:text-white", passwordConfirmStrength.styles)}
															{...field}
														/>
														<Button
															className="text-muted-foreground absolute inset-y-0 end-0"
															onClick={handlePasswordVisibilityToggle}
															aria-hidden="true"
															variant="link"
															tabIndex={-1}
															type="button"
															size="icon"
														>
															{isPasswordVisible ? <EyeOff className="size-4" strokeWidth={2} /> : <Eye className="size-4" strokeWidth={2} />}
														</Button>
													</div>
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
				<div className="text-center text-xs text-balance text-neutral-500 dark:text-neutral-400 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-neutral-900 dark:[&_a]:hover:text-neutral-50">
					By clicking continue, you agree to our <Link to={{ pathname: "/legal" }}>Terms of Service</Link> and <Link to={{ pathname: "/legal" }}>Privacy Policy</Link>.
				</div>
			</div>
		</div>
	);
}
