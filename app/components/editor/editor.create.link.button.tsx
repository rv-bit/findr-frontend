import "@blocknote/shadcn/style.css";
import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

import type { BlockNoteEditor } from "@blocknote/core";
import React from "react";
import { PiLink } from "react-icons/pi";

export function CreateLinkButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;
	const [open, setOpen] = useState(false);

	const [isSelected, setIsSelected] = useState<boolean>(editor.getActiveStyles().bold || false);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(editor.getActiveStyles().bold || false);
	}, editor);

	return (
		<>
			<Components.FormattingToolbar.Button
				mainTooltip={"Link"}
				onClick={() => {
					setOpen(true);
				}}
				isSelected={isSelected}
			>
				<PiLink size={17} />
			</Components.FormattingToolbar.Button>

			{open && (
				<LinkModal
					editor={editor}
					open={open}
					onOpenChange={(open) => {
						setOpen(open);
					}}
				/>
			)}
		</>
	);
}

const newLinkSchema = z.object({
	link: z.string().url().nonempty("Link is required"),
	text: z.string(),
});

function LinkModal({
	editor,
	open,
	onOpenChange,
}: ModalProps & {
	editor: BlockNoteEditor;
}) {
	const [loading, setLoading] = React.useState(false);

	const newLinkForm = useForm<z.infer<typeof newLinkSchema>>({
		mode: "onChange",
		resolver: zodResolver(newLinkSchema),
		defaultValues: {
			link: editor.getSelectedLinkUrl() || "",
			text: editor.getSelectedText() || "",
		},
	});

	const { formState } = newLinkForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = async (values: z.infer<typeof newLinkSchema>) => {
		setLoading(true);

		await editor.createLink(values.link, values.text);

		setLoading(false);

		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>Add Link</AlertDialogTitle>
					<AlertDialogDescription className="hidden space-y-0"></AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					<Form {...newLinkForm}>
						<form className="w-full" onSubmit={newLinkForm.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<FormField
										control={newLinkForm.control}
										name="text"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Link Text" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={newLinkForm.control}
										name="link"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="https://example.com" required {...field} />
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
										{loading ? "Loading..." : "Save"}
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
