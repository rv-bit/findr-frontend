import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "~/lib/auth.client";

import type { ModalProps } from "~/lib/types/ui/modal";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const newUsernameSchema = z.object({
	username: z.string().nonempty("Username is required"),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [loading, setLoading] = React.useState(false);

	const { data: session, error, isPending } = authClient.useSession();

	const newUsernameForm = useForm<z.infer<typeof newUsernameSchema>>({
		mode: "onChange",
		resolver: zodResolver(newUsernameSchema),
		defaultValues: {
			username: "",
		},
	});

	const { formState } = newUsernameForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = React.useCallback(
		async (values: z.infer<typeof newUsernameSchema>) => {
			if (values.username === session?.user?.username) {
				newUsernameForm.setError("username", {
					type: "manual",
					message: "Username is the same as the current one",
				});
				return;
			}

			await authClient.updateUser(
				{
					username: values.username,
				},
				{
					onRequest: () => {
						setLoading(true);
					},
					onResponse: (context) => {
						setLoading(false);
					},
					onError: (context) => {
						newUsernameForm.setError("username", {
							type: "manual",
							message: context.error.message,
						});
					},
					onSuccess: () => {
						onOpenChange(false);

						window.location.reload();
					},
				},
			);
		},
		[session, onOpenChange],
	);

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>Change Username</AlertDialogTitle>
					<AlertDialogDescription className="space-y-0">Change your username to something new.</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					<Form {...newUsernameForm}>
						<form className="w-full" onSubmit={newUsernameForm.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<FormField
										control={newUsernameForm.control}
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
