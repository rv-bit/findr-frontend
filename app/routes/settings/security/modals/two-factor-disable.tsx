import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSession } from "~/hooks/use-auth";
import { authClient } from "~/lib/auth";
import type { ModalProps } from "~/lib/types/modal";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const twoFactorEnableSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const { refetch } = useSession();
	const [loading, setLoading] = React.useState(false);

	const twoFactorForm = useForm<z.infer<typeof twoFactorEnableSchema>>({
		mode: "onChange",
		resolver: zodResolver(twoFactorEnableSchema),
		defaultValues: {
			password: "",
		},
	});

	const { formState } = twoFactorForm;
	const isFormIsComplete = formState.isValid;

	const handleEnableSubmit = async (values: z.infer<typeof twoFactorEnableSchema>) => {
		await authClient.twoFactor.disable({
			password: values.password,
			fetchOptions: {
				onRequest: () => {
					setLoading(true);
				},
				onResponse: () => {
					setLoading(false);
				},
				onSuccess: async () => {
					onOpenChange(false);

					await refetch();
					window.location.reload();
				},
				onError: (ctx) => {
					twoFactorForm.setError("password", {
						message: ctx.error.message,
					});
				},
			},
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader className="space-y-0">
					<AlertDialogTitle>Deactivate Two-Factor Authentication</AlertDialogTitle>
					<AlertDialogDescription>Please enter your password to disable two-factor authentication, you can re-enable it at any time.</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					<Form {...twoFactorForm}>
						<form className="w-full" onSubmit={twoFactorForm.handleSubmit(handleEnableSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<FormField
										control={twoFactorForm.control}
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
