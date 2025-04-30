import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { Link, useSearchParams } from "react-router";

import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "~/lib/auth";
import axiosInstance from "~/lib/axios-instance";

import { cn, formatTime } from "~/lib/utils";

import type { User } from "~/lib/types/shared";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";

import Loading from "~/icons/loading";

import { BiDownvote, BiSolidDownvote, BiSolidUpvote, BiUpvote } from "react-icons/bi";

import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";

import { useMutateCommentVote } from "~/hooks/useMutateCommentVote";
import CommentBox from "./comment.box";
import { sortOptions } from "./comments.section";

export type CommentNode = {
	id: string;
	text: string;
	postId: string;
	parentId: string | null;
	upvoted: boolean;
	downvoted: boolean;
	user: User;
	createdAt: Date;
	updatedAt: Date;
	replyCount: number;
	replies: CommentNode[];
};

type CommentNodeProps = React.ComponentProps<"section"> & {
	comment: CommentNode;
};

type CommentsProps = React.ComponentProps<"section"> & {
	postId: string;
};

function Comments({ className, postId, ...props }: React.HTMLAttributes<HTMLDivElement> & CommentsProps) {
	const [searchParams, setSearchParams] = useSearchParams();

	const inViewportRef = React.useRef(null);

	const fetchTopLevelComments = React.useCallback(async ({ page, postId }: { page: number; postId: string }) => {
		const { data } = await axiosInstance.get(`/api/v0/comments/${postId}/?page=${page}`);
		return data;
	}, []);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, status } = useInfiniteQuery({
		staleTime: 1000 * 60 * 1, // 1 minutes
		enabled: true,
		queryKey: ["comments", postId],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			return fetchTopLevelComments({ page: pageParam, postId });
		},
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => lastPage.nextCursor,
		getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => firstPage.prevCursor,
	});

	const sortedData = React.useMemo(() => {
		if (!data) return [];
		const currentSortOption = searchParams.get("filter") || sortOptions[0].value;

		const sortFn = sortOptions.find((option) => option.value === currentSortOption)?.sortingFn;
		if (sortFn) {
			return data.pages.flatMap((page) => page.data).sort(sortFn) as CommentNode[];
		}

		return data.pages.flatMap((page) => page.data) as CommentNode[];
	}, [data, searchParams]);

	React.useEffect(() => {
		if (!inViewportRef.current) return;

		if (status === "success") {
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						fetchNextPage();
					}
				},
				{ threshold: 1 },
			);

			observer.observe(inViewportRef.current);
			return () => {
				observer.disconnect();
			};
		}
	}, [status, fetchNextPage, inViewportRef]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-6">
				<div className="size-10 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
			</div>
		);
	}

	if (!data?.pages[0]?.data?.length) {
		return <div className="py-4 text-center text-neutral-500 dark:text-neutral-400">No comments yet. Be the first to comment!</div>;
	}

	return (
		<div className={cn("space-y-4", className)}>
			{data?.pages.map((page, index) => (
				<div key={index}>
					{sortedData.map((comment: CommentNode) => {
						return <CommentNode key={comment.id} comment={comment} />;
					})}
				</div>
			))}

			{hasNextPage && (
				<div ref={inViewportRef} className="py-2 text-center">
					{isFetchingNextPage ? (
						<div className="flex items-center justify-center">
							<Loading className="size-6" />
						</div>
					) : (
						<button
							onClick={() => fetchNextPage()}
							className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
						>
							Load More Comments
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function CommentNode({ className, comment, ...props }: React.HTMLAttributes<HTMLDivElement> & CommentNodeProps) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [showReplies, setShowReplies] = React.useState(true);

	const fetchReplies = React.useCallback(async ({ page, commentId }: { page: number; commentId: string }) => {
		const { data } = await axiosInstance.get(`/api/v0/comments/replies/${commentId}/?page=${page}`);
		return data;
	}, []);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
		staleTime: 1000 * 60 * 1, // 1 minutes
		enabled: showReplies, // Only fetch replies when showReplies is true
		queryKey: ["replies", comment.id],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			return fetchReplies({ page: pageParam, commentId: comment.id });
		},
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => lastPage.nextCursor,
		getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => firstPage.prevCursor,
	});

	const repliesCount = React.useMemo(() => {
		if (data) {
			return data.pages.reduce((acc, page) => acc + page.data.length, 0);
		}
		return comment.replyCount || 0;
	}, [data, comment.replyCount]);

	const repliesData = React.useMemo(() => {
		if (!data) return [];
		return data.pages.flatMap((page) => page.data) as CommentNode[];
	}, [data]);

	const hasReplies = repliesCount > 0;

	return (
		<div ref={containerRef} className={cn("comment-thread-item relative mb-4", className)}>
			<CommentContent comment={comment} />

			{hasReplies && !showReplies && (
				<div className="mt-1 ml-12">
					<Button
						variant={"link"}
						onClick={() => setShowReplies(true)}
						className="flex items-center gap-1 p-0 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
					>
						<ChevronRight className="mr-1 size-4" />
						Show replies ({repliesCount})
					</Button>
				</div>
			)}

			{showReplies && (
				<div className="mt-1 ml-12">
					{hasReplies && (
						<>
							<Button
								variant={"link"}
								onClick={() => setShowReplies(false)}
								className="mb-2 flex items-center gap-1 p-0 text-xs text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
							>
								<ChevronDown className="mr-1 size-4" />
								Hide replies
							</Button>

							{isLoading ? (
								<div className="flex items-center justify-start py-2">
									<div className="size-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
									<span className="ml-2 text-xs text-neutral-500">Loading replies...</span>
								</div>
							) : (
								<>
									{repliesData.map((reply) => (
										<CommentNode key={reply.id} comment={reply} className="ml-0" />
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
													Loading more...
												</>
											) : (
												<>Show more replies ({repliesCount - repliesData.length})</>
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
}

const newCommentSchema = z.object({
	content: z.string().min(1, { message: "Comment is required" }),
});

const CommentContent = React.forwardRef<HTMLTextAreaElement, CommentNodeProps>(({ className, comment, ...props }, commentTextAreaRef) => {
	const queryKey = React.useMemo(() => {
		if (comment.parentId) {
			return ["replies", comment.parentId];
		}
		return ["comments", comment.postId];
	}, [comment.postId, comment.parentId]);

	const { mutate } = useMutateCommentVote({
		queryKey: queryKey,
	});
	const { data: session } = authClient.useSession();

	const [replyCommentBoxOpen, setReplyCommentBoxOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(false);

	const newCommentForm = useForm<z.infer<typeof newCommentSchema>>({
		mode: "onChange",
		resolver: zodResolver(newCommentSchema),
		defaultValues: {
			content: "",
		},
	});

	const handleUpvote = () => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ commentId: comment.id, type: "upvote" });
	};

	const handleDownvote = () => {
		if (!session || !session.user) {
			toast.error("You need to be logged in");
			return;
		}

		mutate({ commentId: comment.id, type: "downvote" });
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
		setReplyCommentBoxOpen(false);
		newCommentForm.reset(); // Reset the form values

		if (commentTextAreaRef && "current" in commentTextAreaRef && commentTextAreaRef.current) {
			commentTextAreaRef.current.value = "";
			commentTextAreaRef.current.style.height = "auto";
			commentTextAreaRef.current.blur();
		}
	};

	const handleSubmit = (values: z.infer<typeof newCommentSchema>) => {
		if (!session || !session.user) {
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
					toast.success("Comment added successfully");
					newCommentForm.reset(); // Reset the form values
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
					<AvatarImage
						loading="lazy"
						src={`${comment.user.image?.startsWith("http") ? comment.user.image : `${import.meta.env.VITE_CLOUD_FRONT_URL}/${comment.user.image}`}`}
						alt={comment.user.username}
					/>
					<AvatarFallback className="rounded-lg bg-sidebar-foreground/50 text-[0.75rem]">
						{comment.user.username
							?.split(" ")
							.map((name) => name[0])
							.join("")}
					</AvatarFallback>
				</Avatar>

				<span className="flex w-full flex-col justify-center gap-1">
					<span className="flex items-center justify-start gap-1">
						<HoverCard>
							<HoverCardTrigger asChild>
								<Link
									to={`/users/${comment.user.username}`}
									className="group flex w-fit cursor-pointer items-center justify-start gap-1"
								>
									<h2 className="text-sm break-all text-black group-hover:text-primary-300 dark:text-white group-hover:dark:text-primary-300">
										{comment.user.username}
									</h2>
								</Link>
							</HoverCardTrigger>
							<HoverCardContent align="start" className="flex flex-col gap-2 rounded-2xl border-none dark:bg-modal"></HoverCardContent>
						</HoverCard>

						<span className="my-0 inline-block text-[#333a3e] dark:text-[#333a3e]">•</span>
						<h2 className="text-xs text-black dark:text-white">{formatTime(comment.createdAt)}</h2>
						{isEdited && <span className="text-xs text-black/50 dark:text-white/50">(edited) at {formatTime(comment.updatedAt)}</span>}
					</span>

					<span className="flex flex-col justify-start gap-0">
						<p className="text-sm text-black/50 dark:text-white/50">{comment.text}</p>

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
									if (!session || !session.user) {
										toast.error("You need to be logged in");
										return;
									}

									setReplyCommentBoxOpen((prev) => !prev);
								}}
								className="flex h-8 w-fit items-center justify-center gap-1 rounded-3xl bg-transparent px-3 py-2 text-black hover:bg-[#75858f]/20 dark:bg-transparent dark:text-white dark:hover:bg-[#333a3e] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
							>
								<MessageCircle />
								<span className="text-sm text-black dark:text-white">Reply</span>
							</Button>
						</span>
					</span>
					{replyCommentBoxOpen && (
						<div className="mt-2">
							<CommentBox
								className="w-full"
								ref={commentTextAreaRef}
								open={true}
								disabled={loading}
								form={newCommentForm}
								onHandleOpenCommentButton={handleOpenCommentButton}
								onHandleSubmit={handleSubmit}
								onCancelComment={handleCloseCommentButton}
							/>
						</div>
					)}
				</span>
			</span>
		</summary>
	);
});

export default Comments;
