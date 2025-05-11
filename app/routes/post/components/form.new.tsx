"use client";
import React from "react";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	CodeToggle,
	CreateLink,
	headingsPlugin,
	InsertThematicBreak,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	quotePlugin,
	StrikeThroughSupSubToggles,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
	type MDXEditorMethods,
} from "@mdxeditor/editor";

import axiosInstance from "~/lib/axios-instance";

import type { AxiosError } from "axios";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

const MAX_TITLE_LENGTH = 100;
const newPostSchema = z.object({
	title: z.string().nonempty("Title is required").max(MAX_TITLE_LENGTH),
	content: z.string().nonempty("Content is required"),
});

export default function ActionForm({ ...props }: React.ComponentPropsWithoutRef<"section">) {
	const navigate = useNavigate();
	const contentRef = React.useRef<MDXEditorMethods>(null);

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

		const content = contentRef.current?.getMarkdown();
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
											<MDXEditor
												ref={contentRef}
												markdown={field.value}
												onChange={field.onChange}
												plugins={[
													quotePlugin(),
													listsPlugin(),
													headingsPlugin({
														allowedHeadingLevels: [1, 2, 3],
													}),
													quotePlugin(),
													thematicBreakPlugin(),
													markdownShortcutPlugin(),
													linkPlugin(),
													linkDialogPlugin(),
													toolbarPlugin({
														toolbarContents: () => (
															<>
																<UndoRedo />
																<BoldItalicUnderlineToggles />
																<StrikeThroughSupSubToggles />
																<CreateLink />
																<BlockTypeSelect />
																<div className="_toolbarGroupOfGroups_uazmk_217">
																	<ListsToggle options={["bullet", "number"]} />
																	<CodeToggle />
																	<InsertThematicBreak />
																</div>
															</>
														),
													}),
												]}
												contentEditableClassName="px-3"
											/>
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
