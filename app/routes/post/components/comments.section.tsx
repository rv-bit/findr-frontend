import type { AxiosError } from "axios";

import React from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "~/lib/utils";

import { authClient } from "~/lib/auth";
import axiosInstance from "~/lib/axios-instance";

import type { Post, User } from "~/lib/types/shared";

import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

import { CaseSensitive, ImageIcon } from "lucide-react";

import queryClient from "~/lib/query/query-client";

import Comments, { type CommentNode } from "./comments.nodes";

type CommentSectionProps = React.ComponentProps<"section"> & {
	data: Post & {
		user: User;
	};
};

export const sortOptions: {
	title: string;
	value: string;
	sortingFn?: (a: CommentNode, b: CommentNode) => number;
}[] = [
	{
		title: "Newest",
		value: "newest",
		sortingFn: (a: CommentNode, b: CommentNode) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		},
	},
	{
		title: "Oldest",
		value: "oldest",
		sortingFn: (a: CommentNode, b: CommentNode) => {
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		},
	},
	// {
	// 	title: "Top",
	// 	value: "top",
	// 	sortingFn: (a: CommentNode, b: CommentNode) => {
	// 		return b.likesCount - a.likesCount;
	// 	},
	// },
];

const newCommentSchema = z.object({
	content: z.string().nonempty("Content is required"),
});

const CommentSection = React.forwardRef<HTMLTextAreaElement, CommentSectionProps>(({ className, data, ...props }, commentTextAreaRef) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const { data: session } = authClient.useSession();

	const [currentSortOption, setCurrentSortOption] = React.useState(sortOptions[0].value);
	const [commentButtonClicked, setCommentButtonClicked] = React.useState(false);

	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const [isClient, setIsClient] = React.useState(false);

	const newCommentForm = useForm<z.infer<typeof newCommentSchema>>({
		mode: "onChange",
		resolver: zodResolver(newCommentSchema),
		defaultValues: {
			content: "",
		},
	});

	const handleSubmit = (values: z.infer<typeof newCommentSchema>) => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		const { content } = values;

		setLoading(true);

		axiosInstance
			.post(
				"/api/v0/comments/insert",
				{
					...values,
					content: content,
					postId: data.id,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			)
			.then((response) => {
				setLoading(false);

				if (response.status === 200) {
					toast.success("Comment added successfully");
					newCommentForm.reset(); // Reset the form values

					queryClient.invalidateQueries({ queryKey: ["comments", data.id] }); // Invalidate the comments query to refetch the comments
				} else {
					toast.error("Failed to add comment");
				}
			})
			.catch((error: AxiosError) => {
				setLoading(false);

				const errorData = error.response?.data as { error: string };
				setError(errorData.error);
			});
	};

	const handleOpenCommentButton = () => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		setCommentButtonClicked(true);

		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.focus();
		}
	};

	const handleCloseCommentButton = () => {
		setCommentButtonClicked(false);

		newCommentForm.reset(); // Reset the form values

		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.value = "";
			commentTextAreaRef.current.style.height = "auto";
			commentTextAreaRef.current.blur();
		}
	};

	React.useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<section className={cn("flex flex-col gap-5", className)}>
			<div
				onClick={handleOpenCommentButton}
				className={cn(
					"group relative flex cursor-default flex-col items-center justify-between overflow-hidden rounded-full border border-neutral-500/50 bg-transparent px-0 py-0 pb-0 font-bricolage text-black focus-within:border-neutral-500 dark:border-white/50 dark:bg-transparent dark:text-white focus-within:dark:border-white",
					{
						"h-auto min-h-35 items-start rounded-xl hover:bg-transparent dark:hover:bg-transparent": commentButtonClicked,
						"h-10 hover:bg-sidebar-foreground/20 max-sm:h-auto max-sm:min-h-10 dark:hover:bg-sidebar-accent-foreground/10":
							!commentButtonClicked,
					},
				)}
			>
				<Form {...newCommentForm}>
					<form className="w-full" onSubmit={newCommentForm.handleSubmit(handleSubmit)}>
						<FormField
							control={newCommentForm.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											{...field}
											ref={commentTextAreaRef}
											required
											readOnly={!isClient || !session || !session.user} // <-- make textarea readonly if not logged in
											onClick={handleOpenCommentButton} // <-- trigger toast
											placeholder="Join in the conversation"
											className={cn(
												"rounded-xl border-none px-5 font-bricolage text-sm text-black shadow-none focus-within:border-none focus-visible:ring-0 md:text-sm dark:text-white",
												{
													"min-h-20 resize-y py-3 font-light": commentButtonClicked,
													"min-h-0 resize-none py-0 pt-2.5 max-sm:pt-4 max-sm:pb-1": !commentButtonClicked,
													"cursor-default": !isClient || !session || !session.user,
												},
											)}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{commentButtonClicked && (
							<div className="relative bottom-0 flex h-15 w-full items-end justify-between gap-1 dark:bg-sidebar">
								<div className="flex w-full items-end justify-start gap-1 pb-2 pl-2 dark:bg-sidebar">
									<Button
										type="button"
										disabled
										onClick={(e) => {
											e.stopPropagation();
										}}
										className="size-8 rounded-full bg-transparent p-0 text-sm font-semibold text-black transition-all duration-200 ease-in-out hover:bg-sidebar-foreground/80 hover:text-white dark:bg-transparent dark:text-white dark:hover:bg-sidebar-foreground/20 [&_svg]:size-auto"
									>
										<ImageIcon size={18} />
									</Button>
									<Button
										type="button"
										disabled
										onClick={(e) => {
											e.stopPropagation();
										}}
										className="size-8 rounded-full bg-transparent p-0 text-sm font-semibold text-black transition-all duration-200 ease-in-out hover:bg-sidebar-foreground/80 hover:text-white dark:bg-transparent dark:text-white dark:hover:bg-sidebar-foreground/20 [&_svg]:size-auto"
									>
										<CaseSensitive size={18} />
									</Button>
								</div>
								<div className="flex w-full items-end justify-end gap-1 pr-2 pb-2 dark:bg-sidebar">
									<Button
										disabled={loading}
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleCloseCommentButton();
										}}
										className="rounded-full bg-sidebar-accent-foreground/30 px-5 py-2 text-sm font-semibold text-black transition-all duration-200 ease-in-out hover:bg-sidebar-foreground/80 hover:text-white dark:bg-sidebar-accent/50 dark:text-white dark:hover:bg-sidebar-foreground/20"
									>
										Cancel
									</Button>
									<Button
										disabled={loading}
										type="submit"
										className="rounded-full bg-primary-500/70 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-primary-500 dark:bg-primary-500/80 dark:text-white dark:hover:bg-primary-500"
									>
										Comment
									</Button>
								</div>
							</div>
						)}
					</form>
				</Form>
			</div>

			<div className="flex w-full flex-col gap-5">
				<section className="flex w-full items-center gap-1">
					<p className="text-sm font-semibold text-black/50 dark:text-white/50">Sort by:</p>
					<Select
						defaultValue={currentSortOption}
						onValueChange={(value) => {
							setCurrentSortOption(value);

							setSearchParams((prev) => {
								prev.set("filter", value);
								return prev;
							});
						}}
					>
						<SelectTrigger className="min-h-5 w-fit min-w-6 gap-1 rounded-full border-0 pl-4 text-black shadow-none focus-visible:border-0 focus-visible:ring-0 data-[placeholder]:text-black dark:dark:bg-transparent dark:text-white dark:dark:hover:bg-sidebar-accent/60 dark:focus-visible:border-0 dark:focus-visible:ring-0 dark:data-[placeholder]:text-white">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent className="w-20 rounded-sm border-0 p-0 shadow-none dark:bg-modal">
							<h1 className="px-2 pt-2 pb-3 text-sm font-semibold text-black dark:text-white">Sort by</h1>
							{sortOptions.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									className="cursor-pointer py-2 text-left hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent"
								>
									{option.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</section>

				<Comments postId={data.id} />
			</div>
		</section>
	);
});

CommentSection.displayName = "CommentSection";

export default CommentSection;
