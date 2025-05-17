// organize-imports-ignore

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import "~/styles/form.default.mdx.css";

import React from "react";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { en } from "@blocknote/core/locales";

import { codeBlock } from "@blocknote/code-block";
import { CreateLinkButton, FormattingToolbar, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

import { useTheme } from "~/providers/Theme";

import type { AxiosError } from "axios";
import axiosInstance from "~/lib/axios.instance";

import { CodeBockButton } from "~/components/editor/editor.codeblock.button";
import { HeadingButton } from "~/components/editor/editor.heading.button";
import { QuoteButton } from "~/components/editor/editor.quote.button";
import { BoldButton } from "~/components/editor/editor.bold.button";
import { ItalicButton } from "~/components/editor/editor.italic.button";
import { StrikeThroughButton } from "~/components/editor/editor.strikethrough.button";
import { CodeButton } from "~/components/editor/editor.code.button";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

import * as ButtonPrimitive from "~/components/ui/button";
import { NumberedListButton } from "~/components/editor/editor.numbered.lists.button";
import { BulletListButton } from "~/components/editor/editor.lists.button";

const MAX_TITLE_LENGTH = 100;
const newPostSchema = z.object({
	title: z.string().nonempty("Title is required").max(MAX_TITLE_LENGTH),
	content: z.string().nonempty("Content is required"),
});

export default function ActionForm({ ...props }: React.ComponentPropsWithoutRef<"section">) {
	const locale = en;

	const { theme } = useTheme();
	const navigate = useNavigate();

	const editor = useCreateBlockNote({
		codeBlock: {
			...codeBlock,
			indentLineWithTab: true,
			defaultLanguage: "typescript",
			supportedLanguages: {
				typescript: {
					name: "TypeScript",
					aliases: ["ts"],
				},
			},
		},
		dictionary: {
			...locale,
			placeholders: {
				...locale.placeholders,
				emptyDocument: "",
				default: "",
				heading: "",
			},
		},
	});

	const [currentCharacterTitleCount, setCurrentCharacterTitleCount] = React.useState(0);
	const [error, setError] = React.useState<string>();
	const [loading, setLoading] = React.useState(false);

	const newPostForm = useForm<z.infer<typeof newPostSchema>>({
		mode: "onChange",
		resolver: zodResolver(newPostSchema),
		defaultValues: {
			title: "",
			content: "",
		},
	});

	const { formState } = newPostForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = (values: z.infer<typeof newPostSchema>) => {
		setLoading(true);

		const content = values.content;
		const slug = values.title.toLowerCase().trim().replace(/\s/g, "-");

		if (!content) {
			setLoading(false);
			return;
		}

		axiosInstance
			.post(
				"/api/v0/post/insert",
				{
					...values,
					slug,
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
		newPostForm.setValue("title", "");
		setCurrentCharacterTitleCount(0);

		return () => {
			newPostForm.reset();
		};
	}, []);

	React.useEffect(() => {
		const { unsubscribe } = newPostForm.watch((value) => {
			const newDescription = newPostForm.watch("title");
			setCurrentCharacterTitleCount(newDescription.length);
		});

		return () => unsubscribe();
	}, [newPostForm.watch, newPostForm.trigger]);

	return (
		<section className="flex w-full flex-col gap-5">
			<Form {...newPostForm}>
				<form className="w-full" onSubmit={newPostForm.handleSubmit(handleSubmit)}>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<div className="text-sm text-red-500 dark:text-red-400">{error}</div>
						</div>
						<div className="flex flex-col gap-7">
							<div className="flex flex-col gap-2">
								<FormField
									control={newPostForm.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Textarea
													{...field}
													placeholder="Title"
													maxLength={MAX_TITLE_LENGTH}
													className="resize-none rounded-xl text-black dark:text-white"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<span className="w-full text-right text-sm text-gray-500 dark:text-gray-400">
									<span className="text-gray-500 dark:text-gray-400">{currentCharacterTitleCount}</span>
									<span className="text-gray-500 dark:text-gray-400">/</span>
									<span className="text-gray-500 dark:text-gray-400">{MAX_TITLE_LENGTH}</span>
								</span>
							</div>

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
												shadCNComponents={{
													Button: ButtonPrimitive,
												}}
											>
												<FormattingToolbar>
													<HeadingButton key={"headingStyleButton"} />
													<QuoteButton key={"quoteStyleButton"} />

													<BoldButton key={"boldStyleButton"} />
													<ItalicButton key={"italicStyleButton"} />
													<StrikeThroughButton key={"strikeStyleButton"} />

													<CodeBockButton key={"codeBlock"} />
													<CodeButton key={"codeStyleButton"} />

													<NumberedListButton key={"numberedListButton"} />
													<BulletListButton key={"bulletListButton"} />

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
