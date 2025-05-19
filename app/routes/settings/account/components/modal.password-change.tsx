// organize-imports-ignore

import React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "~/lib/auth-client";
import type { ModalProps } from "~/lib/types/ui/modal";
import { cn } from "~/lib/utils";

import { Eye, EyeOff } from "lucide-react";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { getPasswordStrength, strengthVariants } from "~/styles/variants/password-variants";

const newPasswordSchema = z
	.object({
		currentPassword: z.string().min(8, "Password must be at least 8 characters"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		newPasswordConfirm: z.string(),
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "New password must be different from the current password",
		path: ["newPassword"],
	})
	.refine((data) => data.newPassword === data.newPasswordConfirm, {
		message: "Passwords do not match",
		path: ["newPasswordConfirm"],
	});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [loading, setLoading] = React.useState(false);

	const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

	const newPasswordForm = useForm<z.infer<typeof newPasswordSchema>>({
		mode: "onChange",
		resolver: zodResolver(newPasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			newPasswordConfirm: "",
		},
	});

	const { formState } = newPasswordForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
		await authClient.changePassword(
			{
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onResponse: (context) => {
					setLoading(false);
				},
				onSuccess: () => {
					onOpenChange(false);
				},
				onError: (context) => {
					newPasswordForm.setError("currentPassword", {
						type: "manual",
						message: context.error.message,
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
		const value = newPasswordForm.watch("newPassword");
		const score = getPasswordStrength(value?.toString() ?? "");

		return strengthVariants[score as keyof typeof strengthVariants];
	}, [newPasswordForm.watch]);

	const passwordConfirmStrength = React.useMemo(() => {
		const value = newPasswordForm.watch("newPasswordConfirm");
		const score = getPasswordStrength(value?.toString() ?? "");

		return strengthVariants[score as keyof typeof strengthVariants];
	}, [newPasswordForm.watch]);

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>Password Change</AlertDialogTitle>
					<AlertDialogDescription className="space-y-0">Change your password.</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					<Form {...newPasswordForm}>
						<form className="w-full" onSubmit={newPasswordForm.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<FormField
										control={newPasswordForm.control}
										name="currentPassword"
										render={({ field }) => (
											<FormItem>
												<div className="flex items-center justify-end">
													<Link
														viewTransition
														to={{
															pathname: "/auth/forgot-password",
														}}
														className="text-xs text-neutral-500 hover:underline dark:text-neutral-400"
													>
														Forgot password?
													</Link>
												</div>
												<FormControl>
													<Input type="password" placeholder="current password" required {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={newPasswordForm.control}
										name="newPassword"
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
															`text-muted-foreground mb-1.5 h-4 text-right text-xs ${newPasswordForm.watch("newPassword").length > 0 ? "block" : "hidden"}`,
														)}
													>
														{passwordStrength.verdict}
													</motion.div>
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={isPasswordVisible ? "text" : "password"}
															placeholder="new password"
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
										name="newPasswordConfirm"
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
															`text-muted-foreground mb-1.5 h-4 text-right text-xs ${newPasswordForm.watch("newPasswordConfirm").length > 0 ? "block" : "hidden"}`,
														)}
													>
														{passwordConfirmStrength.verdict}
													</motion.div>
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															type={isPasswordVisible ? "text" : "password"}
															placeholder="confirm new password"
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

								<AlertDialogFooter>
									<Button
										type="button"
										className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
										onClick={() => onOpenChange(false)}
									>
										Cancel
									</Button>
									<Button type="submit" className="rounded-3xl p-5 py-6" disabled={!isFormIsComplete || loading}>
										{loading ? "Loading..." : "Continue"}
									</Button>
								</AlertDialogFooter>
							</div>
						</form>
					</Form>
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
}
