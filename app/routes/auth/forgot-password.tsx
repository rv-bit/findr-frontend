import type { Route } from "./+types/forgot-password";

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "~/hooks/use-toast";

import { authClient } from "~/lib/auth";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";

const formSchema = z.object({
	email: z.string().email().nonempty("Email is required"),
});

const newPasswordSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters long"),
	confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function ForgotPassword() {
	const location = useLocation();
	const navigate = useNavigate();
	const toast = useToast();
	const [searchParams, setSearchParams] = useSearchParams();

	const [currentStep, setCurrentStep] = useState(0); // 0 = email, 1 = new password
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const token = searchParams.get("token"); // Check if token is present
		if (token) {
			setCurrentStep(1); // Show new password form
		}
	}, [searchParams]);

	useEffect(() => {
		const locationState = location.state;

		if (locationState) {
			if (locationState.from === "create-password") {
				if (locationState.email) {
					form.setValue("email", locationState.email);
				}
			}
		}
	}, [location]);

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
		setLoading(true);

		toast.toast({
			title: "Info",
			description: "If the email exists in our system, you will receive an email with instructions to reset your password",
		});

		const { data, error } = await authClient.forgetPassword({
			email: values.email,
			redirectTo: "/auth/forgot-password/",
		});

		setLoading(false);

		if (error) {
			toast.toast({
				title: "Error",
				description: error.message,
			});
			return;
		}
	};

	const handleSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
		if (values.password !== values.confirmPassword) {
			newPasswordForm.setError("confirmPassword", {
				type: "manual",
				message: "Passwords do not match",
			});
			return;
		}

		setLoading(true);

		const { data, error } = await authClient.resetPassword({
			token: searchParams.get("token")!,
			newPassword: values.confirmPassword,
		});

		setLoading(false);

		if (error) {
			toast.toast({
				title: "Error",
				description: error.message,
			});
			return;
		}

		toast.toast({
			title: "Success",
			description: "Password reset successfully",
		});

		navigate("/auth");
	};

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
													<FormControl>
														<Input type="password" placeholder="password" required {...field} />
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
													<FormControl>
														<Input type="password" placeholder="confirm password" required {...field} />
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
