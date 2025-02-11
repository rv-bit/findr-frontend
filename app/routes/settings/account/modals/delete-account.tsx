import React from "react";
import { toast } from "sonner";

import type { ModalProps } from "~/lib/types/modal";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

export default function Index({ open, onOpenChange, onClickAction }: ModalProps) {
	const [loading, setLoading] = React.useState(false);

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Account</AlertDialogTitle>
					<AlertDialogDescription className="space-y-0">Are you sure you want to delete your account? This action cannot be undone.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button type="button" className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40 rounded-3xl p-5 py-6" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						disabled={loading}
						onClick={async (e) => {
							if (onClickAction) {
								setLoading(true);
								await onClickAction(e);
								setLoading(false);

								onOpenChange(false);

								toast.error("Account Deletion", {
									description: "If the email exists in our system, you will receive an email with instructions to delete your account",
								});
							}
						}}
						className="rounded-3xl p-5 py-6"
					>
						{loading ? "Loading..." : "Continue"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
