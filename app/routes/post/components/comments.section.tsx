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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import queryClient from "~/lib/query/query-client";

import CommentBox from "./comment.box";
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

	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

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
				(async () => {
					const promise = new Promise((resolve) => setTimeout(resolve, 2000));
					await promise; // add a timeout since the comment is added instantly, and the UI could format the time in negative

					setLoading(false);
					if (response.status === 200) {
						toast.success("Comment added successfully");
						newCommentForm.reset(); // Reset the form values

						queryClient.invalidateQueries({ queryKey: ["comments", data.id] });
					} else {
						toast.error("Failed to add comment");
					}
				})();
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

		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.focus();
		}
	};

	const handleCloseCommentButton = () => {
		newCommentForm.reset(); // Reset the form values

		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.value = "";
			commentTextAreaRef.current.style.height = "auto";
			commentTextAreaRef.current.blur();
		}
	};

	return (
		<section className={cn("flex flex-col gap-5", className)}>
			<CommentBox
				className="w-full"
				ref={commentTextAreaRef}
				readOnly={!session || !session.user}
				form={newCommentForm}
				onHandleOpenCommentButton={handleOpenCommentButton}
				onHandleSubmit={handleSubmit}
				onCancelComment={handleCloseCommentButton}
				disabled={loading}
			/>

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
