import editor_stylesheet from "~/styles/form.default.mdx.css?url";
import type { Route } from "./+types/new";

import type { AxiosError } from "axios";

import React from "react";
import { useLoaderData, useNavigate } from "react-router";
import { ClientOnly } from "remix-utils/client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	codeBlockPlugin,
	CodeToggle,
	headingsPlugin,
	InsertThematicBreak,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	quotePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
	type MDXEditorMethods,
} from "@mdxeditor/editor";
import { useForm } from "react-hook-form";
import { z } from "zod";

import axiosInstance from "~/lib/axios-instance";

import type { Post, User } from "~/lib/types/shared";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

export async function loader({ params }: Route.LoaderArgs) {
	const { postId } = params;

	if (!postId) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const response = await axiosInstance.get(`/api/v0/post/${postId}`);
	if (response.status !== 200) {
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	const data = response.data.data as Post & { user: User };
	if (!data) {
		// Check if the post exists
		throw new Response("", { status: 302, headers: { Location: "/" } }); // Redirect to home
	}

	return { data };
}

interface ErrorPost {
	error: string;
}

// making only one schema for now, since the other two types are disabled
const newPostSchema = z.object({
	content: z.string().nonempty("Content is required"),
});

export default function Index() {
	const loaderData = useLoaderData<typeof loader>();
	const navigate = useNavigate();

	const contentRef = React.useRef<MDXEditorMethods>(null);

	const [error, setError] = React.useState<string>();
	const [loading, setLoading] = React.useState(false);

	const newPostForm = useForm<z.infer<typeof newPostSchema>>({
		mode: "onChange",
		resolver: zodResolver(newPostSchema),
		defaultValues: {
			content: loaderData.data.content,
		},
	});

	const { formState } = newPostForm;
	const isFormIsComplete = formState.isValid;

	const handleSubmit = (values: z.infer<typeof newPostSchema>) => {
		setLoading(true);

		const content = contentRef.current?.getMarkdown();

		if (!content) {
			setLoading(false);
			return;
		}

		axiosInstance
			.post(
				`/api/v0/post/edit/${loaderData.data.id}`,
				{
					...values,
					content,
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

				const errorData = error.response?.data as ErrorPost;
				setError(errorData.error);
			});
	};

	return (
		<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
			<div className="flex w-full max-w-5xl flex-col gap-5 px-10 pt-8 max-sm:px-4">
				<h1 className="mb-2 text-3xl font-semibold text-black capitalize dark:text-white">Editing Post</h1>
				<section className="flex w-full flex-col gap-2">
					<h1 className="text-xl">{loaderData.data.title}</h1>
					<Form {...newPostForm}>
						<form className="w-full" onSubmit={newPostForm.handleSubmit(handleSubmit)}>
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
													<ClientOnly>
														{() => (
															<MDXEditor
																ref={contentRef}
																markdown={field.value}
																onChange={field.onChange}
																plugins={[
																	quotePlugin(),
																	listsPlugin(),
																	codeBlockPlugin(),
																	headingsPlugin({
																		allowedHeadingLevels: [1, 2, 3],
																	}),
																	quotePlugin(),
																	thematicBreakPlugin(),
																	markdownShortcutPlugin(),
																	toolbarPlugin({
																		toolbarContents: () => (
																			<>
																				{/* <ToggleGroup type="multiple" size={"lg"}>
																					<ToggleGroupItem
																						onSelect={(e: React.SyntheticEvent<HTMLButtonElement>) => {
																							e.preventDefault();
																							applyFormat$({ type: "bold" });
																						}}
																						value="bold"
																						aria-label="Bold"
																					>
																						<Bold />
																					</ToggleGroupItem>
																				</ToggleGroup> */}

																				<UndoRedo />
																				<hr className="h-5 border-l-2 border-sidebar-foreground dark:border-sidebar-accent" />
																				<BoldItalicUnderlineToggles />
																				<BlockTypeSelect />
																				<hr className="h-5 border-l-2 border-sidebar-foreground dark:border-sidebar-accent" />
																				<ListsToggle options={["bullet", "number"]} />
																				<hr className="h-5 border-l-2 border-sidebar-foreground dark:border-sidebar-accent" />
																				<CodeToggle />
																				<InsertThematicBreak />
																			</>
																		),
																	}),
																]}
																className="px-3 py-2"
															/>
														)}
													</ClientOnly>
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
			</div>
		</div>
	);
}
