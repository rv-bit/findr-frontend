import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router";

import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMutateCommentVote } from "~/hooks/useMutateCommentVote";

import axiosInstance from "~/lib/axios.instance";
import { cn, formatTime } from "~/lib/utils";

import type { Session } from "~/lib/auth-client";

import HoverCardUser from "~/components/hover.card.user";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { BiDownvote, BiSolidDownvote, BiSolidUpvote, BiUpvote } from "react-icons/bi";

import { MAX_CONTENT_LENGTH, newCommentSchema } from "~/routes/post/shared/schemas";
import type { CommentNode } from "~/routes/post/shared/types";

import { useRepliesVisibilityStore } from "~/routes/post/stores/useRepliesVisibility";

import CommentBox from "~/routes/post/components/comment.box";

type CommentNodeProps = React.ComponentProps<"section"> & {
	mainCommentId?: string;
	comment: CommentNode;
	session: Session | null;
};

const fetchReplies = async ({ commentId, page = 1 }: { commentId: string; page: number }) => {
	const { data } = await axiosInstance.get(`/api/v0/comments/replies/${commentId}/?page=${page}`);
	return data;
};

const Comment = React.memo(({ className, mainCommentId, comment, ...props }: React.HTMLAttributes<HTMLDivElement> & CommentNodeProps) => {
	const containerRef = React.useRef<HTMLDivElement>(null);

	const isVisible = useRepliesVisibilityStore((state) => state.isVisible(comment.id));
	const setVisibility = useRepliesVisibilityStore((state) => state.setVisibility);

	const hasReplies = comment.replyCount > 0;

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: isVisible && hasReplies,
		queryKey: ["individual-comment-replies", comment.id],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			return fetchReplies({ commentId: comment.id, page: pageParam });
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		getPreviousPageParam: (firstPage) => firstPage.prevCursor,
	});

	const repliesData = React.useMemo(() => {
		if (!data) return [];
		return data.pages.flatMap((page) => page.data) as CommentNode[];
	}, [data]);

	const toggleReplies = () => {
		if (!isVisible && hasReplies) {
			// If we're showing replies, refetch to get the latest data
			refetch();
		}

		setVisibility(comment.id, !isVisible);
	};

	return (
		<div ref={containerRef} className={cn("comment-thread-item mb-4", className)}>
			<CommentContent mainCommentId={mainCommentId} comment={comment} session={props.session} />

			{hasReplies && !isVisible && (
				<div className="mt-1 ml-12">
					<Button
						variant="link"
						onClick={toggleReplies}
						className="flex items-center gap-1 p-0 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
					>
						<ChevronRight className="mr-1 size-4" />
						Show replies ({comment.replyCount})
					</Button>
				</div>
			)}

			{isVisible && (
				<div className="mt-1 ml-12">
					{hasReplies && (
						<>
							<Button
								variant="link"
								onClick={toggleReplies}
								className="mb-2 flex items-center gap-1 p-0 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
							>
								<ChevronDown className="mr-1 size-4" />
								Hide replies
							</Button>

							{isLoading ? (
								<div className="flex items-center justify-start py-2">
									<div className="size-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
								</div>
							) : (
								<>
									{repliesData.map((reply) => (
										<Comment key={reply.id} comment={reply} session={props.session} className="ml-0" />
									))}

									{hasNextPage && (
										<button
											onClick={() => fetchNextPage()}
											disabled={isFetchingNextPage}
											className="mt-2 flex items-center text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
										>
											{isFetchingNextPage ? (
												<>
													<div className="size-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
												</>
											) : (
												<>Show more replies ({comment.replyCount - repliesData.length})</>
											)}
										</button>
									)}
								</>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
});

const CommentContent = React.memo(({ className, mainCommentId, comment, ...props }: React.HTMLAttributes<HTMLDivElement> & CommentNodeProps) => {
	const queryClient = useQueryClient();

	const commentTextAreaRef = React.useRef<HTMLTextAreaElement>(null);

	const [replyCommentBoxOpen, setReplyCommentBoxOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(false);

	const queryKey = React.useMemo(() => {
		if (mainCommentId) {
			return ["individual-comment", mainCommentId];
		}

		if (comment.parentId) {
			return ["individual-comment-replies", comment.parentId];
		}

		return ["individual-comment-replies", comment.id];
	}, [comment]);

	const { mutate } = useMutateCommentVote({
		queryKey: queryKey,
	});

	const newCommentForm = useForm<z.infer<typeof newCommentSchema>>({
		mode: "onChange",
		resolver: zodResolver(newCommentSchema),
		defaultValues: {
			content: "",
		},
	});

	const handleUpvote = () => {
		if (!props.session || !props.session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ commentId: comment.id, type: "upvote" });
	};

	const handleDownvote = () => {
		if (!props.session || !props.session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ commentId: comment.id, type: "downvote" });
	};

	const handleOpenCommentButton = () => {
		if (!props.session || !props.session.user) {
			toast.error("You need to be logged in");
			return;
		}

		setReplyCommentBoxOpen(true);
	};

	const handleCloseCommentButton = () => {
		setReplyCommentBoxOpen(false);
		newCommentForm.reset(); // Reset the form values
	};
	const handleSubmit = (values: z.infer<typeof newCommentSchema>) => {
		if (!props.session || !props.session.user) {
			toast.error("You need to be logged in");
			return;
		}

		const { content } = values;

		setLoading(true);

		axiosInstance
			.post(
				"/api/v0/comments/insertReply/",
				{
					content: content,
					postId: comment.postId,
					commentId: comment.id,
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
					toast.success("Reply added successfully");
					newCommentForm.reset(); // Reset the form values
					setReplyCommentBoxOpen(false);

					queryClient.setQueryData(queryKey, (oldData: any) => {
						if (!oldData) return oldData;

						// Function to update a comment in an array
						const updateComment = (comments: any[]) => {
							return comments.map((c) => {
								if (c.id === comment.id) {
									return {
										...c,
										replyCount: (c.replyCount || 0) + 1,
									};
								}
								return c;
							});
						};

						// Update different data structures based on query type
						if (Array.isArray(oldData)) {
							return updateComment(oldData);
						} else if (oldData.pages) {
							return {
								...oldData,
								pages: oldData.pages.map((page: any) => ({
									...page,
									data: updateComment(page.data),
								})),
							};
						}

						return oldData;
					});

					// Force refresh the replies query
					queryClient.invalidateQueries({
						queryKey: ["individual-comment-replies", comment.id],
						exact: true,
					});

					// Invalidate any parent comment queries
					if (comment.parentId) {
						queryClient.invalidateQueries({
							queryKey: ["individual-comment-replies", comment.parentId],
							exact: true,
						});
					}

					queryClient.invalidateQueries({
						queryKey: ["individual-comment"],
						exact: false,
					});
				}
			})
			.catch((error) => {
				setLoading(false);
				toast.error("Failed to add comment");
			});
	};

	const isEdited = React.useMemo(() => {
		if (comment.createdAt !== comment.updatedAt) {
			return true;
		}
		return false;
	}, [comment]);

	return (
		<summary className={cn("comment-content contents", className)} {...props}>
			<span className="flex items-start justify-start gap-2">
				<Avatar className="size-9 rounded-full">
					<AvatarImage loading="lazy" src={comment.user.image ?? ""} alt={comment.user.username} />
					<AvatarFallback className="rounded-lg bg-sidebar-foreground/50 text-[0.75rem]">
						{comment.user.username
							?.split(" ")
							.map((name) => name[0])
							.join("")}
					</AvatarFallback>
				</Avatar>

				<span className="flex w-full flex-col justify-center gap-1">
					<span className="flex items-center justify-start gap-1">
						<HoverCardUser username={comment.user.username}>
							<Link to={`/users/${comment.user.username}`} className="group flex w-fit cursor-pointer items-center justify-start gap-1">
								<h1 className="text-sm break-all text-black group-hover:text-primary-300 dark:text-white group-hover:dark:text-primary-300">
									{comment.user.username}
								</h1>
							</Link>
						</HoverCardUser>
						<span className="my-0 inline-block text-[#333a3e] dark:text-[#333a3e]">•</span>
						<p className="text-xs text-black dark:text-white">{formatTime(comment.createdAt)}</p>
						{isEdited && <span className="text-xs text-black/50 dark:text-white/50">(edited) at {formatTime(comment.updatedAt)}</span>}
					</span>

					<span className="flex flex-col justify-start gap-0">
						<p className="text-sm break-all text-black/50 dark:text-white/50">{comment.text}</p>

						<span className="mt-1 flex items-center justify-start gap-1">
							<span className={cn("flex w-fit items-center justify-between")}>
								<span className="flex items-center justify-center">
									<Button
										onClick={handleUpvote}
										className={cn(
											"group flex size-8 items-center justify-center gap-1 rounded-full bg-transparent p-0 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-auto",
										)}
									>
										{comment.upvoted ? (
											<BiSolidUpvote
												size={19}
												className={cn("group-hover:text-white", {
													"fill-primary-300 dark:fill-primary-300": comment.upvoted,
												})}
											/>
										) : (
											<BiUpvote size={19} className={cn("group-hover:text-primary-400", {})} />
										)}
									</Button>
								</span>

								<h1 className={cn("text-sm text-black/70 dark:text-white", {})}>Vote</h1>

								<span className="flex items-center justify-center">
									<Button
										onClick={handleDownvote}
										className={cn(
											"group flex size-8 items-center justify-center gap-1 rounded-full bg-transparent p-0 text-black/70 shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:size-auto",
										)}
									>
										{comment.downvoted ? (
											<BiSolidDownvote
												size={19}
												className={cn("group-hover:text-white", {
													"fill-red-400 dark:fill-red-400": comment.downvoted,
												})}
											/>
										) : (
											<BiDownvote size={19} className={cn("group-hover:text-red-400", {})} />
										)}
									</Button>
								</span>
							</span>

							<Button
								onClick={() => {
									handleOpenCommentButton();
								}}
								className="flex h-8 w-fit items-center justify-center gap-1 rounded-3xl bg-transparent px-3 py-2 text-black shadow-none hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
							>
								<MessageCircle />
								<span className="text-sm text-black dark:text-white">Reply</span>
							</Button>
						</span>
					</span>
					{replyCommentBoxOpen && (
						<CommentBox
							className="w-full"
							ref={commentTextAreaRef}
							open={replyCommentBoxOpen}
							placeholder="Write a reply..."
							disabled={loading}
							maxLength={MAX_CONTENT_LENGTH}
							form={newCommentForm}
							onHandleSubmit={handleSubmit}
							onCancelComment={handleCloseCommentButton}
						/>
					)}
				</span>
			</span>
		</summary>
	);
});

export default Comment;
