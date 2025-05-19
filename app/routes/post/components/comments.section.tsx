import type { AxiosError } from "axios";

import React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "~/lib/utils";

import axiosInstance from "~/lib/axios.instance";
import queryClient from "~/lib/query-client";

import type { Session } from "~/lib/auth-client";
import type { Post, User } from "~/lib/types/shared";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import { sortOptions } from "../shared/constants";
import { MAX_CONTENT_LENGTH, newCommentSchema } from "../shared/schemas";

const CommentBox = React.lazy(() => import("./comment.box")); // client-side only

import Comments from "./comments.nodes";

type CommentSectionProps = React.ComponentProps<"section"> & {
	data: Post & {
		user: User;
	};
	session: Session | null;
};

const CommentSection = React.forwardRef<HTMLTextAreaElement, CommentSectionProps>(({ className, data, session, ...props }, commentTextAreaRef) => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

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
			navigate("/auth");
			return;
		}

		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.scrollIntoView({
				block: "center",
				behavior: "smooth",
			});

			commentTextAreaRef.current.focus();
		}
	};

	const handleCloseCommentButton = () => {
		newCommentForm.reset();
	};

	const placeholder = React.useMemo(() => {
		if (!session || !session.user) {
			return "Login to join the conversation";
		}

		return "Join in the conversation";
	}, [session]);

	return (
		<section className={cn("flex flex-col gap-5 overflow-hidden", className)}>
			<React.Suspense fallback={<div className="h-10 w-full animate-pulse rounded-md bg-black/10 dark:bg-white/10" />}>
				<CommentBox
					className="w-full"
					ref={commentTextAreaRef}
					readOnly={!session || !session.user}
					placeholder={placeholder}
					disabled={loading}
					maxLength={MAX_CONTENT_LENGTH}
					form={newCommentForm}
					onHandleOpenCommentButton={handleOpenCommentButton}
					onHandleSubmit={handleSubmit}
					onCancelComment={handleCloseCommentButton}
				/>
			</React.Suspense>

			<span className="flex w-full flex-col gap-5">
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

				<Comments postId={data.id} session={session} />
			</span>
		</section>
	);
});

CommentSection.displayName = "CommentSection";

export default CommentSection;
