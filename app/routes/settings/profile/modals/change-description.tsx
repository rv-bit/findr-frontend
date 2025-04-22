import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSession } from "~/hooks/use-auth";

import type { ModalProps } from "~/lib/types/ui/modal";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { authClient } from "~/lib/auth";

const MAX_DESCRIPTION_LENGTH = 100;
const newDescriptionSchema = z.object({
	description: z.string().nonempty("Description is required").max(MAX_DESCRIPTION_LENGTH, "Description is too long"),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [loading, setLoading] = React.useState(false);
	const [currentCharacterCount, setCurrentCharacterCount] = React.useState(0);

	const { user } = useSession();

	const newDescriptionForm = useForm<z.infer<typeof newDescriptionSchema>>({
		mode: "onChange",
		resolver: zodResolver(newDescriptionSchema),
		defaultValues: {
			description: "",
		},
	});

	const { formState } = newDescriptionForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = async (values: z.infer<typeof newDescriptionSchema>) => {
		await authClient.updateUser(
			{
				about_description: values.description,
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onResponse: (context) => {
					setLoading(false);
				},
				onError: (context) => {
					newDescriptionForm.setError("description", {
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
	};

	React.useEffect(() => {
		if (user) {
			newDescriptionForm.setValue("description", user.about_description ?? "");
			setCurrentCharacterCount(user.about_description?.length ?? 0);
		}

		return () => {
			newDescriptionForm.reset();
		};
	}, [user]);

	React.useEffect(() => {
		const { unsubscribe } = newDescriptionForm.watch((value) => {
			newDescriptionForm.trigger("description").then((isValid) => {
				if (!isValid) {
					return;
				}

				const newDescription = newDescriptionForm.watch("description");
				setCurrentCharacterCount(newDescription.length);
			});
		});

		return () => unsubscribe();
	}, [newDescriptionForm.watch, newDescriptionForm.trigger]);

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>Change Description</AlertDialogTitle>
					<AlertDialogDescription className="space-y-0">Change your description to something new.</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					<Form {...newDescriptionForm}>
						<form className="w-full" onSubmit={newDescriptionForm.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<FormField
										control={newDescriptionForm.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea maxLength={MAX_DESCRIPTION_LENGTH} placeholder="description" required {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<span className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
										<span className="text-gray-500 dark:text-gray-400">{currentCharacterCount}</span>
										<span className="text-gray-500 dark:text-gray-400">/</span>
										<span className="text-gray-500 dark:text-gray-400">{MAX_DESCRIPTION_LENGTH}</span>
									</span>

									<span className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
										By continuing with this, you are going to be logged out and you will need to login again with the new username.
									</span>
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
