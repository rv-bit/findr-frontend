import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "~/lib/auth";
import type { ModalProps } from "~/lib/types/modal";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";

const newPasswordSchema = z
	.object({
		currentPassword: z.string().min(8, "Password must be at least 8 characters"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		newPasswordConfirm: z.string().min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "New password must be different from the current password",
		path: ["newPassword"],
	})
	.refine((data) => data.newPassword === data.newPasswordConfirm, {
		message: "Passwords do not match",
	});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [loading, setLoading] = React.useState(false);

	const newPasswordForm = useForm<z.infer<typeof newPasswordSchema>>({
		mode: "onChange",
		resolver: zodResolver(newPasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
		},
	});

	const { formState } = newPasswordForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
		await authClient.changePassword(
			{
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
				revokeOtherSessions: true,
			},
			{
				onRequest: () => {
					setLoading(true);
				},

				onSuccess() {
					onOpenChange(false);
				},

				onError(context) {
					newPasswordForm.setError("currentPassword", {
						type: "manual",
						message: context.error.message,
					});
				},

				onResponse(context) {
					setLoading(false);
				},
			},
		);
	};

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
												<FormControl>
													<Input type="password" placeholder="new password" required {...field} />
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
												<FormControl>
													<Input type="password" placeholder="confirm new password" required {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<AlertDialogFooter>
									<Button
										type="button"
										className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
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
