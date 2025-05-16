"use client";

import React from "react";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
	BasicTextStyleButton,
	BlockTypeSelect,
	ColorStyleButton,
	CreateLinkButton,
	FileCaptionButton,
	FileReplaceButton,
	FormattingToolbar,
	NestBlockButton,
	UnnestBlockButton,
	useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

import { useTheme } from "~/providers/Theme";

import type { AxiosError } from "axios";
import type { Post, User } from "~/lib/types/shared";

import axiosInstance from "~/lib/axios.instance";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";

const newPostSchema = z.object({
	content: z.string().nonempty("Content is required"),
});

export default function ActionForm({
	...props
}: React.ComponentPropsWithoutRef<"section"> & {
	data: Post & { user: User };
}) {
	const { theme } = useTheme();
	const navigate = useNavigate();

	const editor = useCreateBlockNote({});

	const [error, setError] = React.useState<string>();
	const [loading, setLoading] = React.useState(false);

	const newPostForm = useForm<z.infer<typeof newPostSchema>>({
		mode: "onChange",
		resolver: zodResolver(newPostSchema),
		defaultValues: {
			content: JSON.parse(props.data.content),
		},
	});

	const { formState } = newPostForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = (values: z.infer<typeof newPostSchema>) => {
		setLoading(true);

		const content = values.content;
		if (!content) {
			setLoading(false);
			return;
		}

		axiosInstance
			.post(
				`/api/v0/post/edit/${props.data.id}`,
				{
					...values,
					content: JSON.stringify(content),
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			)
			.then((response) => {
				setLoading(false);
				navigate("/");
			})
			.catch((error: AxiosError) => {
				setLoading(false);

				const errorData = error.response?.data as { error: string };
				setError(errorData.error);
			});
	};

	React.useEffect(() => {
		async function loadInitialHTML() {
			const blocks = await editor.tryParseMarkdownToBlocks(JSON.parse(props.data.content));
			editor.replaceBlocks(editor.document, blocks);
		}
		loadInitialHTML();
	}, [editor]);

	return (
		<section className="flex w-full flex-col gap-2">
			<h1 className="text-xl">{props.data.title}</h1>
			<Form {...newPostForm}>
				<form className="w-full text-black dark:text-white" onSubmit={newPostForm.handleSubmit(handleSubmit)}>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<div className="text-sm text-red-500 dark:text-red-400">{error}</div>
						</div>
						<div className="flex flex-col gap-7">
							<FormField
								control={newPostForm.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<BlockNoteView
												editor={editor}
												formattingToolbar={false}
												slashMenu={false}
												sideMenu={false}
												theme={theme ?? "dark"}
												onChange={async (editor) => {
													const changes = await editor.blocksToMarkdownLossy();
													field.onChange(changes);
												}}
											>
												<FormattingToolbar>
													<BlockTypeSelect key={"blockTypeSelect"} />

													<FileCaptionButton key={"fileCaptionButton"} />
													<FileReplaceButton key={"replaceFileButton"} />

													<BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"} />
													<BasicTextStyleButton basicTextStyle={"italic"} key={"italicStyleButton"} />
													<BasicTextStyleButton basicTextStyle={"underline"} key={"underlineStyleButton"} />
													<BasicTextStyleButton basicTextStyle={"strike"} key={"strikeStyleButton"} />

													<BasicTextStyleButton key={"codeStyleButton"} basicTextStyle={"code"} />
													<ColorStyleButton key={"colorStyleButton"} />

													<NestBlockButton key={"nestBlockButton"} />
													<UnnestBlockButton key={"unnestBlockButton"} />

													<CreateLinkButton key={"createLinkButton"} />
												</FormattingToolbar>
											</BlockNoteView>
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
								onClick={() => navigate(-1)}
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
	);
}
