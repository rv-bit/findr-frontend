import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { useSearchParams } from "react-router";

import axiosInstance from "~/lib/axios-instance";
import { cn } from "~/lib/utils";

import Loading from "~/icons/loading";

import { sortOptions } from "./comments.section";

export type CommentNode = {
	id: string;
	text: string;
	parentId: string | null;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	replies: CommentNode[];
};

type CommentNodeProps = React.ComponentProps<"section"> & {
	comment: CommentNode;
};
type CommentsProps = React.ComponentProps<"section"> & {
	postId: string;
};

const Comments = React.forwardRef<HTMLTextAreaElement, CommentsProps>(({ className, postId, ...props }, commentTextAreaRef) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const inViewportRef = React.useRef(null);

	const fetchTopLevelComments = React.useCallback(async ({ page, postId }: { page: number; postId: string }) => {
		const { data } = await axiosInstance.get(`/api/v0/comments/${postId}/?page=${page}`);
		return data;
	}, []);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, status } = useInfiniteQuery({
		staleTime: 1000 * 30, // 30 seconds
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
		const currentSortOption = searchParams.get("filter");

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

	if (isLoading)
		return (
			<div className="flex items-center justify-center py-6">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
			</div>
		);

	if (!data?.pages[0]?.data?.length) {
		return <div className="py-4 text-center text-neutral-500 dark:text-neutral-400">No comments yet. Be the first to comment!</div>;
	}

	return (
		<div className={cn("comments-container space-y-4", className)}>
			{data?.pages.map((page, index) => (
				<div key={index} className="page-comments">
					{sortedData.map((comment: CommentNode) => (
						<CommentNode key={comment.id} comment={comment} />
					))}
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
});

const CommentNode = React.forwardRef<HTMLTextAreaElement, CommentNodeProps>(({ className, comment, ...props }, commentTextAreaRef) => {
	const [showReplies, setShowReplies] = React.useState(true);

	const fetchReplies = React.useCallback(async ({ page, commentId }: { page: number; commentId: string }) => {
		const { data } = await axiosInstance.get(`/api/v0/comments/replies/${commentId}/?page=${page}`);
		return data;
	}, []);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
		staleTime: 1000 * 30, // 30 seconds
		enabled: true,
		queryKey: ["replies", comment.id],
		initialPageParam: 1,
		queryFn: async ({ pageParam }) => {
			return fetchReplies({ page: pageParam, commentId: comment.id });
		},
		getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => lastPage.nextCursor,
		getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => firstPage.prevCursor,
	});

	const hasReplies = data?.pages.some((page) => page.data.length > 0);

	return (
		<div className={cn("comment-thread-item mb-2", className)}>
			{/* Comment content */}
			<div className="comment-content">
				<p className="text-sm text-black dark:text-white">{comment.text}</p>
				<div className="mt-1 flex items-center gap-2">
					<button className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300" onClick={() => refetch()}>
						Reply
					</button>

					{hasReplies && (
						<button
							onClick={() => setShowReplies((prev) => !prev)}
							className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
						>
							{showReplies ? "Hide" : `Show Replies (${data?.pages[0]?.data?.length || 0})`}
						</button>
					)}
				</div>
			</div>

			{/* Replies section with Reddit-style thread line */}
			{(hasReplies || isLoading) && showReplies && (
				<div className="relative mt-2 pl-8">
					{/* Vertical thread line */}
					<div className="absolute top-0 bottom-4 left-3 w-0.5 bg-neutral-300 dark:bg-neutral-700"></div>

					{isLoading ? (
						<div className="pl-2">
							<p className="text-xs text-neutral-500">Loading replies...</p>
						</div>
					) : (
						<div>
							{data?.pages.map((page, idx) => (
								<React.Fragment key={idx}>
									{page.data.map((reply: CommentNode) => (
										<CommentNode key={reply.id} comment={reply} />
									))}
								</React.Fragment>
							))}

							{hasNextPage && (
								<button
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
									className="mt-1 ml-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
								>
									{isFetchingNextPage ? "Loading more..." : "Load More Replies"}
								</button>
							)}
						</div>
					)}
				</div>
			)}

			{/* Show "Load Replies" button when replies aren't loaded yet */}
			{!isLoading && !data && hasReplies && (
				<button onClick={() => refetch()} className="mt-1 ml-8 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
					Load Replies
				</button>
			)}
		</div>
	);
});

Comments.displayName = "Comments";
CommentNode.displayName = "CommentNode";

export default Comments;
