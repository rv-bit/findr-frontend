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

const newEmailSchema = z.object({
	newEmail: z.string().email().nonempty("Email is required"),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [loading, setLoading] = React.useState(false);

	const newEmailForm = useForm<z.infer<typeof newEmailSchema>>({
		mode: "onChange",
		resolver: zodResolver(newEmailSchema),
		defaultValues: {
			newEmail: "",
		},
	});

	const { formState } = newEmailForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = async (values: z.infer<typeof newEmailSchema>) => {
		await authClient.changeEmail(
			{
				newEmail: values.newEmail,
				callbackURL: "/auth/verify-email",
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
					newEmailForm.setError("newEmail", {
						type: "manual",
						message: context.error.message,
					});
				},
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>Change Email</AlertDialogTitle>
					<AlertDialogDescription className="space-y-0">Change your email address</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					<Form {...newEmailForm}>
						<form className="w-full" onSubmit={newEmailForm.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<FormField
										control={newEmailForm.control}
										name="newEmail"
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
