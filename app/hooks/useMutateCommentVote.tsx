import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "~/lib/axios.instance";
import type { Comment } from "~/lib/types/shared";

type VoteVariables = {
	commentId: string;
	type: "upvote" | "downvote";
};

const mutateComment = (comment: Comment, type: "upvote" | "downvote") => {
	let newLikesCount = comment.likesCount;
	let hasUpvoted = comment.upvoted || false;
	let hasDownvoted = comment.downvoted || false;

	if (type === "upvote") {
		if (hasUpvoted) {
			newLikesCount -= 1;
			hasUpvoted = false;
		} else {
			newLikesCount += hasDownvoted ? 2 : 1;
			hasUpvoted = true;
			hasDownvoted = false;
		}
	}

	if (type === "downvote") {
		if (hasDownvoted) {
			newLikesCount += 1;
			hasDownvoted = false;
		} else {
			newLikesCount -= hasUpvoted ? 2 : 1;
			hasDownvoted = true;
			hasUpvoted = false;
		}
	}

	return {
		...comment,
		likesCount: newLikesCount,
		hasUpvoted,
		hasDownvoted,
	};
};

export const useMutateCommentVote = ({ queryKey }: { queryKey: (string | undefined)[] }) => {
	const queryClient = useQueryClient();

	return useMutation<any, unknown, VoteVariables, { previousData: any }>({
		mutationFn: async ({ commentId, type }) => {
			const { data } = await axiosInstance.post(`/api/v0/comments/${type}/${commentId}`);
			return data;
		},

		onMutate: async (variables) => {
			const { commentId, type } = variables;

			await queryClient.cancelQueries({ queryKey: queryKey });

			const previousData = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(queryKey, (oldData: any) => {
				if (!oldData) return oldData;

				// Logic for handling paginated comments
				if (oldData.pages) {
					return {
						...oldData,
						pages: oldData.pages.map((page: any) => {
							if (page.data?.id === commentId) {
								return {
									...page,
									data: mutateComment(page.data, type),
								};
							}

							// Default: no change
							return page;
						}),
					};
				}

				// Single comment data
				if (oldData.id === commentId) {
					return mutateComment(oldData, type);
				}

				return oldData;
			});

			return { previousData };
		},

		onError: (err, variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKey });
		},
	});
};
