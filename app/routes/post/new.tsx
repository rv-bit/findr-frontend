import editor_stylesheet from "~/styles/form.default.mdx.css?url";

import type { Route } from "./+types/index";

import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { ClientOnly } from "remix-utils/client-only";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	BoldItalicUnderlineToggles,
	codeBlockPlugin,
	CodeToggle,
	InsertThematicBreak,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	quotePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
	useCodeBlockEditorContext,
	type CodeBlockEditorDescriptor,
	type MDXEditorMethods,
} from "@mdxeditor/editor";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "~/lib/utils";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: editor_stylesheet }, // override styles
];

interface Types {
	title: string;
	url: string;
	queryKey: string;
	query: string;
	icon?: LucideIcon;
	disabled?: boolean;
}

const types: Types[] = [
	{
		title: "Text",
		url: "/post/new/",
		queryKey: "type",
		query: "text",
	},
	{
		title: "Images",
		url: "/post/new/",
		queryKey: "type",
		query: "images",
		disabled: true,
	},
	{
		title: "Link",
		url: "/post/new/",
		queryKey: "type",
		query: "link",
		disabled: true,
	},
];

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
	// always use the editor, no matter the language or the meta of the code block
	match: (language, meta) => true,
	// You can have multiple editors with different priorities, so that there's a "catch-all" editor (with the lowest priority)
	priority: 0,
	// The Editor is a React component
	Editor: (props) => {
		const cb = useCodeBlockEditorContext();
		// stops the propagation so that the parent lexical editor does not handle certain events.
		return (
			<div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
				<textarea rows={3} cols={20} defaultValue={props.code} onChange={(e) => cb.setCode(e.target.value)} />
			</div>
		);
	},
};

// making only one schema for now, since the other two types are disabled
const newPostSchema = z.object({
	title: z.string().nonempty("Title is required").max(300),
	content: z.string().nonempty("Content is required"),
});

export default function Index({ loaderData }: Route.ComponentProps) {
	const contentRef = React.useRef<MDXEditorMethods>(null);
	const navRef = React.useRef<HTMLDivElement>(null);

	const navGoRightRef = React.useRef<HTMLButtonElement>(null);
	const navGoLeftRef = React.useRef<HTMLButtonElement>(null);

	const location = useLocation();
	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();

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

	const handleSubmit = async (values: z.infer<typeof newPostSchema>) => {
		setLoading(true);

		const content = contentRef.current?.getMarkdown();
		const slug = values.title.toLowerCase().trim().replace(/\s/g, "-");

		if (!content) {
			setLoading(false);
			return;
		}

		const res = await fetch("/api/v1/post/insert", {
			method: "POST",
			body: JSON.stringify({
				...values,
				slug,
				content,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			setLoading(false);
			return;
		}

		setLoading(false);
		navigate("/");
	};

	const handleScrollAndResize = () => {
		if (!navRef.current || !navGoRightRef.current || !navGoLeftRef.current) return;

		const scrollLeft = navRef.current.scrollLeft;
		const scrollWidth = navRef.current.scrollWidth;
		const clientWidth = navRef.current.clientWidth;

		if (scrollLeft > 0) {
			navGoLeftRef.current.classList.remove("hidden");
		} else {
			navGoLeftRef.current.classList.add("hidden");
		}

		if (scrollLeft + clientWidth < scrollWidth) {
			navGoRightRef.current.classList.remove("hidden");
		} else {
			navGoRightRef.current.classList.add("hidden");
		}
	};

	React.useEffect(() => {
		if (!navRef.current) return;
		handleScrollAndResize();

		navRef.current.addEventListener("scroll", handleScrollAndResize);
		window.addEventListener("resize", handleScrollAndResize);

		return () => {
			navRef.current?.removeEventListener("scroll", handleScrollAndResize);
			window.removeEventListener("resize", handleScrollAndResize);
		};
	}, []);

	const isActive = React.useMemo(
		() => (url: string, queryKey: string, query: string) => {
			const isQueryMatch = searchParams.get(queryKey) === query;
			return location.pathname === url && isQueryMatch;
		},
		[location, searchParams],
	);

	return (
		<div className="flex h-full w-full flex-col items-center justify-start max-md:w-screen">
			<div className="flex w-full max-w-5xl flex-col gap-5 px-10 pt-8 max-sm:px-4">
				<h1 className="text-3xl font-semibold capitalize text-black dark:text-white mb-2">Create Post</h1>

				<section className="relative w-full">
					<nav ref={navRef} className="no-scrollbar flex h-full w-full flex-nowrap items-start justify-start gap-2 overflow-x-auto overflow-y-visible">
						{types.map((action, index) => (
							<Button
								key={index}
								variant={"link"}
								disabled={action.disabled}
								onClick={(e) => {
									e.preventDefault();

									navigate(action.url, {
										replace: true,
									});
									setSearchParams({
										[action.queryKey!]: action.query!,
									});
								}}
								className={cn(
									"group relative h-auto min-w-fit shrink-0 items-center justify-center px-4 py-2 hover:no-underline rounded-none",
									isActive(action.url, action?.queryKey, action?.query)
										? "border-b-2 border-black dark:border-white"
										: "hover:border-b-2 hover:border-black/50 dark:hover:border-white/80",
								)}
							>
								{action.icon && <action.icon />}
								<h1
									className={cn(
										"inline-flex text-black",
										isActive(action.url, action?.queryKey, action?.query)
											? "text-black dark:text-white"
											: "group-hover:text-black/50 dark:text-[#8BA2AE] dark:group-hover:text-white/80",
									)}
								>
									{action.title}
								</h1>
							</Button>
						))}
					</nav>

					<div className="absolute left-0 top-0 bg-linear-to-l from-transparent from-0% to-sidebar to-30% pr-3">
						<button
							ref={navGoLeftRef}
							onClick={() => {
								if (navRef.current) {
									navRef.current.scrollBy({ left: -100, behavior: "smooth" });
								}
							}}
							className="flex size-10 items-center justify-center rounded-full bg-transparent hover:bg-gray-600/60 dark:hover:bg-gray-500/40"
						>
							<ChevronLeft className="h-6 w-6 text-black dark:text-white" />
						</button>
					</div>

					<div className="absolute right-0 top-0 bg-linear-to-r from-transparent from-0% to-sidebar to-30% pl-3">
						<button
							ref={navGoRightRef}
							onClick={() => {
								if (navRef.current) {
									navRef.current.scrollBy({ left: 100, behavior: "smooth" });
								}
							}}
							className="flex size-10 items-center justify-center rounded-full bg-transparent hover:bg-gray-600/60 dark:hover:bg-gray-500/40"
						>
							<ChevronRight className="h-6 w-6 text-black dark:text-white" />
						</button>
					</div>
				</section>

				<section className="flex w-full flex-col gap-5">
					<Form {...newPostForm}>
						<form className="w-full" onSubmit={newPostForm.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-7">
									<FormField
										control={newPostForm.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea {...field} placeholder="Title" className="rounded-xl resize-none text-black dark:text-white" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

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
																	quotePlugin(),
																	markdownShortcutPlugin(),
																	thematicBreakPlugin(),
																	toolbarPlugin({
																		toolbarContents: () => (
																			<>
																				<UndoRedo />
																				<hr className="border-sidebar-foreground dark:border-sidebar-accent border-l-2 h-5" />
																				<BoldItalicUnderlineToggles />
																				<hr className="border-sidebar-foreground dark:border-sidebar-accent border-l-2 h-5" />
																				<ListsToggle options={["bullet", "number"]} />
																				<hr className="border-sidebar-foreground dark:border-sidebar-accent border-l-2 h-5" />
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
										className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
										onClick={() => console.log(contentRef.current?.getMarkdown())}
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
