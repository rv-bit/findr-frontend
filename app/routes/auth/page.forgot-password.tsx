import type { Route } from "./+types/forgot-password";

import { motion } from "motion/react";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { Eye, EyeOff } from "lucide-react";

import { getPasswordStrength, strengthVariants } from "~/styles/variants/password-variants";

export function meta({ params }: Route.MetaArgs) {
	return [{ title: "Forgot Password" }, { name: "description", content: "Forgot Password" }];
}

const formSchema = z.object({
	email: z.string().email().nonempty("Email is required"),
});

const newPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export default function ForgotPassword() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const [currentStep, setCurrentStep] = React.useState(0); // 0 = email, 1 = new password
	const [loading, setLoading] = React.useState(false);

	const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const newPasswordForm = useForm<z.infer<typeof newPasswordSchema>>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const handleEmailSubmit = async (values: z.infer<typeof formSchema>) => {
		await authClient.forgetPassword(
			{
				email: values.email,
				redirectTo: "/auth/forgot-password/",
			},
			{
				onRequest: () => {
					setLoading(true);

					toast.info("Sending email...", {
						description: "Please check your email for the password reset link.",
					});
				},
				onSuccess: () => {
					toast.success("Success", {
						description: "Email sent successfully",
					});

					navigate("/auth");
				},
				onResponse: () => {
					setLoading(false);
				},
				onError: (context) => {
					toast.error("Error", {
						description: context.error.message,
					});
				},
			},
		);
	};

	const handleSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
		await authClient.resetPassword(
			{
				token: searchParams.get("token")!,
				newPassword: values.confirmPassword,
			},
			{
				onRequest: () => {
					setLoading(true);
					toast.info("Resetting password...", {
						description: "Please wait...",
					});
				},
				onSuccess: () => {
					toast.success("Success", {
						description: "Password reset successfully",
					});
				},
				onResponse: () => {
					setLoading(false);
				},
				onError: (context) => {
					toast.error("Error", {
						description: context.error.message,
					});
				},
			},
		);
	};

	function handlePasswordVisibilityToggle(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		setIsPasswordVisible(!isPasswordVisible);
	}

	const passwordStrength = React.useMemo(() => {
		const value = newPasswordForm.watch("password");
		const score = getPasswordStrength(value?.toString() ?? "");

		return strengthVariants[score as keyof typeof strengthVariants];
	}, [newPasswordForm.watch]);

	const passwordConfirmStrength = React.useMemo(() => {
		const value = newPasswordForm.watch("confirmPassword");
		const score = getPasswordStrength(value?.toString() ?? "");

		return strengthVariants[score as keyof typeof strengthVariants];
	}, [newPasswordForm.watch]);

	React.useEffect(() => {
		const token = searchParams.get("token"); // Check if token is present
		if (token) {
			setCurrentStep(1); // Show new password form
		}
	}, [searchParams]);

	React.useEffect(() => {
		const locationState = location.state;

		if (locationState) {
			if (locationState.from === "create-password") {
				if (locationState.email) {
					form.setValue("email", locationState.email);
				}
			}
		}
	}, [location]);

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex w-full max-w-lg flex-col gap-6">
				<div className="flex flex-col items-start justify-start gap-2">
					<div className="flex flex-col items-start justify-center gap-1">
						<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Password Reset</h1>
						<p className="text-center text-sm text-neutral-500 dark:text-neutral-400">Enter your email address to reset your password</p>
					</div>

					{currentStep === 0 && (
						<Form {...form}>
							<form className="w-full" onSubmit={form.handleSubmit(handleEmailSubmit)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="email" placeholder="name@example.com" required {...field} />
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
					)}

					{currentStep === 1 && (
						<Form {...newPasswordForm}>
							<form className="w-full" onSubmit={newPasswordForm.handleSubmit(handleSubmit)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<FormField
											control={newPasswordForm.control}
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
															className={cn(
																`text-muted-foreground mb-1.5 h-4 text-right text-xs ${newPasswordForm.watch("password").length > 0 ? "block" : "hidden"}`,
															)}
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
																className={cn(
																	"pe-9 text-black duration-350 dark:text-white",
																	passwordStrength.styles,
																)}
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
																{isPasswordVisible ? (
																	<EyeOff className="size-4" strokeWidth={2} />
																) : (
																	<Eye className="size-4" strokeWidth={2} />
																)}
															</Button>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={newPasswordForm.control}
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
															className={cn(
																`text-muted-foreground mb-1.5 h-4 text-right text-xs ${newPasswordForm.watch("password").length > 0 ? "block" : "hidden"}`,
															)}
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
																className={cn(
																	"pe-9 text-black duration-350 dark:text-white",
																	passwordConfirmStrength.styles,
																)}
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
																{isPasswordVisible ? (
																	<EyeOff className="size-4" strokeWidth={2} />
																) : (
																	<Eye className="size-4" strokeWidth={2} />
																)}
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
					)}
				</div>
			</div>
		</div>
	);
}
