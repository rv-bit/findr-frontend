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
import { FormattingToolbar, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

import { useTheme } from "~/providers/Theme";

import type { AxiosError } from "axios";
import axiosInstance from "~/lib/axios.instance";

import {
	BoldButton,
	BulletListButton,
	CodeBockButton,
	HeadingButton,
	ItalicButton,
	NumberedListButton,
	QuoteButton,
	StrikeThroughButton,
} from "~/components/editor/editor.buttons";
import { CreateLinkButton } from "~/components/editor/editor.create.link.button";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import TextareaLabel from "~/components/ui/textarea-label";

import * as ButtonPrimitive from "~/components/ui/button";

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
				text: {
					name: "Plain Text",
					aliases: ["txt"],
				},
				typescript: {
					name: "TypeScript",
					aliases: ["ts"],
				},
				javascript: {
					name: "JavaScript",
					aliases: ["js"],
				},
				json: {
					name: "JSON",
					aliases: ["json"],
				},
				html: {
					name: "HTML",
					aliases: ["html"],
				},
				css: {
					name: "CSS",
					aliases: ["css"],
				},
			},
		},
		dictionary: {
			...locale,
			placeholders: {
				...locale.placeholders,
				emptyDocument: "Body Text (optional)",
				default: "",
				heading: "",
				heading_2: "",
				heading_3: "",
				numberedListItem: "",
				bulletListItem: "",
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
												<TextareaLabel
													{...field}
													required
													maxLength={MAX_TITLE_LENGTH}
													className="h-auto min-h-2 resize-none overflow-hidden rounded-xl border-2 text-black focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-white dark:focus-visible:ring-primary-400"
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
													<span className="flex items-center justify-start">
														<BoldButton key={"boldStyleButton"} />
														<ItalicButton key={"italicStyleButton"} />
														<StrikeThroughButton key={"strikeStyleButton"} />
														<HeadingButton key={"headingStyleButton"} />
													</span>

													<Separator className="h-6 w-[2.5px] rounded-full bg-sidebar-accent-foreground/10 dark:bg-sidebar-accent-foreground/10" />

													<span className="flex items-center justify-start">
														<CreateLinkButton key={"createLinkButton"} />
														<BulletListButton key={"bulletListButton"} />
														<NumberedListButton key={"numberedListButton"} />
													</span>

													<Separator className="h-6 w-[2.5px] rounded-full bg-sidebar-accent-foreground/10 dark:bg-sidebar-accent-foreground/10" />

													<span className="flex items-center justify-start">
														<QuoteButton key={"quoteStyleButton"} />
														<CodeBockButton key={"codeBlock"} />
													</span>
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
